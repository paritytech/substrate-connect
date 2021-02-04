import test from 'ava';
import sinon from 'sinon';
import { Database } from './Database';
import { SmoldotProvider } from './SmoldotProvider';
import { SmoldotClient, SmoldotOptions } from 'smoldot';

type RpcResponder = (request: string) => string;

const EMPTY_CHAIN_SPEC = '{}';

const systemHealthReponse = (id: number, peerCount: number) => {
  return `{"jsonrpc":"2.0","id":${id} ,"result":{"isSyncing":true,"peers":${peerCount},"shouldHavePeers":true}}`;
}

// Always responds to a health request with a response that has peers
const healthyResponder = requestJSON => {
  const id = JSON.parse(requestJSON).id;
  return systemHealthReponse(id, 1);
}

// Always responds to a health request with a response that has no peers
const unhealthyResponder = requestJSON => {
  const id = JSON.parse(requestJSON).id;
  return systemHealthReponse(id, 0);
}

// Always responds with an error reponse
const erroringResponder = requestJSON => {
  const id = JSON.parse(requestJSON).id;
  return `{ "id": ${id}, "jsonrpc": "2.0", "error": {"code": 666, "message": "boom!" } }`;
}

// Orchestrates a sequence of has peers / has no peers responses
const customHealthResponder = (hasPeers: boolean[]) => {
  return requestJSON => {
    if (hasPeers.shift()) {
      return healthyResponder(requestJSON);
    } else {
      return unhealthyResponder(requestJSON);
    }
  };
}
// Mimics the behaviour of the WASM light client by deferring a call to 
// `json_rpc_callback` after it is called which returns the response
// returned by the supplied `responder`.
//
// If this is called with an rpc string containing the word subscribe (but not
// unsubscribe), it is considered a subscription and `responder` must have 2
// mock responses for each subscriptionrequest that the test will make.  The
// first returning the subscription id.  The second a response to the
// subscription.
const fakeRpcSend = (options: SmoldotOptions, responder: RpcResponder, healthResponder: RpcResponder) => {
  return (rpcRequest: string) => {
    process.nextTick(() => {
      if (/system_health/.test(rpcRequest)) {
        options.json_rpc_callback(healthResponder(rpcRequest));
        return;
      }

      // non-health reponse
      options.json_rpc_callback(responder(rpcRequest))
      if (/(?<!un)[sS]ubscribe/.test(rpcRequest)) {
        options.json_rpc_callback(responder(rpcRequest))
      }
    });
  };
}

// Creates a fake smoldot. Calls to send use `fakeRpcSend` to mimic the light
// client behaviour
const mockSmoldot = (responder: RpcResponder, healthResponder = healthyResponder) => {
  return {
    start: async (options: SmoldotOptions): Promise<SmoldotClient> => {
      return Promise.resolve({
        // fake the async reply by using the reponder to format
        // a reply via options.json_rpc_callback
        send_json_rpc: fakeRpcSend(options, responder, healthResponder)
      });
    }
  };
};

// Creates a spying `smoldot` that records calls to `json_rpc_send` in `rpcSpy`
// and then uses `fakeRpcSend` to mimic the light client behaviour.
const smoldotSpy = (responder: RpcResponder, rpcSpy: any, healthResponder = healthyResponder) => {
  return {
    start: async (options: SmoldotOptions): Promise<SmoldotClient> => {
      return Promise.resolve({
        send_json_rpc: (rpc: string) => {
          // record the message call
          rpcSpy(rpc);
          // fake the async reply using the responder
          fakeRpcSend(options, responder, healthResponder)(rpc);
        }
      });
    }
  };
};

// Creates an `RpcResponder` with a queue of mock reponses to respond with.
const respondWith = (jsonResponses: string[]) => {
  return (_: string) => {
    const mockResponse = jsonResponses.shift();
    if (!mockResponse) { 
      throw new Error("json_rpc_callback was called but there are no mock responses left to respond with"); 
    }
    return mockResponse;
  };
}

class TestDatabase implements Database {
  load(): string  { return ''; }
  save(state: string) {}
  delete() {}
}
const testDb = () => new TestDatabase();

test('connect propagates errors', async t => {
  const badSmoldot = {
    start: async (options: SmoldotOptions): Promise<SmoldotClient> => {
      return Promise.reject(new Error('boom!'));
    }
  };
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, testDb(), badSmoldot);
  let errored = false;

  provider.on('error', () => { errored = true; });
  try {
    await provider.connect();
  } catch (_) {
    t.true(errored);
    await provider.disconnect();
  }
});

// non-subscription send
test('awaiting send returns message result', async t => {
  const mockResponses =  ['{ "id": 1, "jsonrpc": "2.0", "result": "success" }'];
  const ms = mockSmoldot(respondWith(mockResponses));
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, testDb(), ms);

  await provider.connect();
  const reply = await provider.send('hello', [ 'world' ]);
  t.is(reply, 'success');
  await provider.disconnect();
});

test('emits error when system_health responds with error', async t => {
  const ms = mockSmoldot(respondWith([]), erroringResponder);
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, testDb(), ms);

  // we don't want the test to be slow
  provider.healthPingerInterval = 1;
  await provider.connect();
  return new Promise<void>((resolve, reject) => {
    provider.on('error', error => {
      t.is(error.message, 'Got error response asking for system health');
      return provider.disconnect().then(() => resolve());
    });
  });
});

test('emits events when it connects then disconnects', async t => {
  const ms = mockSmoldot(respondWith([]), customHealthResponder([true, false]));
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, testDb(), ms);

  // we don't want the test to be slow
  provider.healthPingerInterval = 1;
  await provider.connect();
  return new Promise<void>((resolve, reject) => {
    provider.on('connected', () => {
      const off = provider.on('disconnected', () => {
        t.pass();
        off(); // stop listening
        provider.disconnect().then(() => resolve());

      });
    });
  });
});

test('emits events when it connects / disconnects / reconnects', async t => {
  const ms = mockSmoldot(respondWith([]), customHealthResponder([true, false, true]));
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, testDb(), ms);

  // we don't want the test to be slow
  provider.healthPingerInterval = 1;
  await provider.connect();

  // callback hell caused by using event handlers for control flow
  return new Promise<void>((resolve, reject) => {
    provider.on('connected', () => {
      const off = provider.on('disconnected', () => {
        off(); // stop listening
        provider.on('connected', () => {
          t.pass();
          provider.disconnect().then(() => resolve());
        });
      });
    });
  });

});

test('send formats JSON RPC request correctly', async t => {
  // we don't really care what the reponse is
  const responses =  ['{ "id": 1, "jsonrpc": "2.0", "result": "success" }'];
  const rpcSend = sinon.spy();
  const ss = smoldotSpy(respondWith(responses), rpcSend);
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, testDb(), ss);

  await provider.connect();
  const reply = await provider.send('hello', [ 'world' ]);
  t.true(rpcSend.called);
  const rpcJson = rpcSend.firstCall.firstArg;
  t.is(rpcJson, '{"id":1,"jsonrpc":"2.0","method":"hello","params":["world"]}');
  await provider.disconnect();
});

test('sending twice uses new id', async t => {
  const responses =  [ 
    '{ "id": 1, "jsonrpc": "2.0", "result": "success" }',
    '{ "id": 2, "jsonrpc": "2.0", "result": "success" }'
  ];
  const rpcSend = sinon.spy();
  const ss = smoldotSpy(respondWith(responses), rpcSend);
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, testDb(), ss);

  await provider.connect();
  await provider.send('hello', [ 'world' ]);
  await provider.send('hello', [ 'world' ]);

  t.true(rpcSend.called);
  t.true(rpcSend.calledTwice);

  const rpcJson1 = rpcSend.firstCall.firstArg;
  t.is(rpcJson1, '{"id":1,"jsonrpc":"2.0","method":"hello","params":["world"]}');
  const rpcJson2 = rpcSend.secondCall.firstArg;
  t.is(rpcJson2, '{"id":2,"jsonrpc":"2.0","method":"hello","params":["world"]}');
  await provider.disconnect();
});

test('throws when got error JSON response', async t => {
  const ms = mockSmoldot(erroringResponder);
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, testDb(), ms);

  await provider.connect();
  await t.throwsAsync(async () => {
    await provider.send('hello', [ 'world' ]);
  }, {instanceOf: Error, message: '666: boom!'});
  await provider.disconnect();
});

test('send can also add subscriptions and returns an id', async t => {
  const responses = [
    '{"jsonrpc":"2.0","result":"SUBSCRIPTIONID","id":1}',
    '{"jsonrpc":"2.0","method":"state_test","params":{"result":{"dummy":"state"},"subscription":"SUBSCRIPTIONID"}}'
  ];
  const ms = mockSmoldot(respondWith(responses));
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, testDb(), ms);

  await provider.connect();
  const reply = await provider.send('test_subscribe', []);
  t.is(reply, 'SUBSCRIPTIONID');
  await provider.disconnect();
});

test('subscribe', async t => {
  const responses = [
    '{"jsonrpc":"2.0","result":"SUBSCRIPTIONID","id":1}',
    '{"jsonrpc":"2.0","method":"state_test","params":{"result":{"dummy":"state"},"subscription":"SUBSCRIPTIONID"}}'
  ];
  const ms = mockSmoldot(respondWith(responses));
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, testDb(), ms);

  await provider.connect();

  t.plan(2);
  return new Promise<void>((resolve, reject) => {
    return provider.subscribe('state_test', 'test_subscribe', [],  (error: Error | null, result: any) => {
      if (error !== null) {
        t.fail(error.message);
        reject();
      }

      t.deepEqual(result, { dummy: "state" });
      provider.disconnect();
      resolve();
    }).then(reply => {
      t.is(reply, "SUBSCRIPTIONID");
    });
  });
});

test('subscribe copes with out of order responses', async t => {
  const responses = [
    '{"jsonrpc":"2.0","method":"state_test","params":{"result":{"dummy":"state"},"subscription":"SUBSCRIPTIONID"}}',
    '{"jsonrpc":"2.0","result":"SUBSCRIPTIONID","id":1}'
  ];
  const ms = mockSmoldot(respondWith(responses));
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, testDb(), ms);

  await provider.connect();

  t.plan(2);
  return new Promise<void>((resolve, reject) => {
    return provider.subscribe('state_test', 'test_subscribe', [],  (error: Error | null, result: any) => {
      if (error !== null) {
        t.fail(error.message);
        reject();
      }

      t.deepEqual(result, { dummy: "state" });
      provider.disconnect().then(() => {
        resolve();
      });
    }).then(reply => {
      t.is(reply, "SUBSCRIPTIONID");
    });
  });
});

test('converts british english method spelling to US', async t => {
  const responses = [
    '{"jsonrpc":"2.0","result":"SUBSCRIPTIONID","id":1}',
    '{"jsonrpc":"2.0","method":"chain_finalisedHead","params":{"result":{"dummy":"state"},"subscription":"SUBSCRIPTIONID"}}'
  ];
  const ms = mockSmoldot(respondWith(responses));
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, testDb(), ms);

  await provider.connect();

  t.plan(2);
  return new Promise<void>((resolve, reject) => {
    return provider.subscribe('chain_finalizedHead', 'chain_subscribeFinalizedHeads', [],  (error: Error | null, result: any) => {
      if (error !== null) {
        t.fail(error.message);
        reject();
      }

      t.deepEqual(result, { dummy: "state" });
      return provider.disconnect().then(() => resolve());
    }).then(reply => {
      t.is(reply, "SUBSCRIPTIONID");
    });
  });
});

test('unsubscribe fails when sub not found', async t => {
  const responses = [
    '{ "id": 1, "jsonrpc": "2.0", "result": "SUBSCRIPTIONID"  }',
    '{"jsonrpc":"2.0","method":"chain_finalisedHead","params":{"result":{"dummy":"state"},"subscription":"SUBSCRIPTIONID"}}'
  ];
  const ms = mockSmoldot(respondWith(responses));
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, testDb(), ms);

  await provider.connect();
  await provider.subscribe('test', 'test_subscribe', [], () => {});
  const reply =  await provider.unsubscribe('test', 'test_subscribe', 666);

  t.false(reply);
  await provider.disconnect();
});

test('unsubscribe removes subscriptions', async t => {
  const responses = [
    '{ "id": 1, "jsonrpc": "2.0", "result": "SUBSCRIPTIONID" }',
    '{"jsonrpc":"2.0","method":"test","params":{"result":{"dummy":"state"},"subscription":"SUBSCRIPTIONID"}}',
    '{ "id": 2, "jsonrpc": "2.0", "result": true }'
  ];
  const ms = mockSmoldot(respondWith(responses));
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, testDb(), ms);

  await provider.connect();
  const id = await provider.subscribe('test', 'test_subscribe', [], () => {});
  const reply =  await provider.unsubscribe('test', 'test_unsubscribe', id);
  t.true(reply);
  provider.disconnect();
});
