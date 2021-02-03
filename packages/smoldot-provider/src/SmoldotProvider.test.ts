import test from 'ava';
import sinon from 'sinon';
import { Database } from './Database';
import { SmoldotProvider } from './SmoldotProvider';
import { SmoldotClient, SmoldotOptions } from 'smoldot';

type RpcResponder = (message: string) => string;

const EMPTY_CHAIN_SPEC = '{}';

const systemHealthReponse = peerCount => {
  return `{\"jsonrpc\":\"2.0\",\"id\":42,\"result\":{\"isSyncing\":true,\"peers\":${peerCount},\"shouldHavePeers\":true}}"`;
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
const fakeRpcSend = (options: SmoldotOptions, responder: RpcResponder) => {
  return (rpc: string) => {
    process.nextTick(() => {
      if (/system_health/.test(rpc)) {
        options.json_rpc_callback(systemHealthReponse(1));
        return;
      }

      // non-health reponse
      options.json_rpc_callback(responder(rpc))
      if (/(?<!un)[sS]ubscribe/.test(rpc)) {
        options.json_rpc_callback(responder(rpc))
      }
    });
  };
}

// Creates a fake smoldot. Calls to send use `fakeRpcSend` to mimic the light
// client behaviour
const mockSmoldot = (responder: RpcResponder) => {
  return {
    start: async (options: SmoldotOptions): Promise<SmoldotClient> => {
      return Promise.resolve({
        // fake the async reply by using the reponder to format
        // a reply via options.json_rpc_callback
        send_json_rpc: fakeRpcSend(options, responder)
      });
    }
  };
};

// Creates a spying `smoldot` that records calls to `json_rpc_send` in `rpcSpy`
// and then uses `fakeRpcSend` to mimic the light client behaviour.
const smoldotSpy = (responder: RpcResponder, rpcSpy: any) => {
  return {
    start: async (options: SmoldotOptions): Promise<SmoldotClient> => {
      return Promise.resolve({
        send_json_rpc: (rpc: string) => {
          // record the message call
          rpcSpy(rpc);
          // fake the async reply using the responder
          fakeRpcSend(options, responder)(rpc);
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
  const responses =  [
    '{ "id": 1, "jsonrpc": "2.0", "error": {"code": 666, "message": "boom!" } }'
  ];
  const ms = mockSmoldot(respondWith(responses));
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
      provider.disconnect().then(() => {
        resolve();
      });
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
