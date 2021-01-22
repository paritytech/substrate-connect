import test from 'ava';
import sinon from 'sinon';
import Database from './Database';
import { SmoldotProvider } from './SmoldotProvider';
import { SmoldotClient, SmoldotOptions } from 'smoldot';

type RpcResponder = (message: string) => string;

const EMPTY_CHAIN_SPEC = '{}';
// Mimics the behaviour of the WASM light client by deferring a call to 
// `json_rpc_callback` after it is called which returns the response
// returned by the supplied `responder`.
const fakeRpcSend = (options: SmoldotOptions, responder: RpcResponder) => {
  return (rpc: string) => {
    process.nextTick(() => {
      options.json_rpc_callback(responder(rpc))
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

const fakeRpcSendForSubscription = (options: SmoldotOptions, responder: RpcResponder) => {
  return (rpc: string) => {
    process.nextTick(() => {
      options.json_rpc_callback(responder(rpc))
      options.json_rpc_callback(responder(rpc))
    });
  };
}

// responder should have 2 mock responses for each request that the test will
// make.  The first returning the subscription id.  The second a response to
// the subscription.
const mockSmoldotForSubscription = (responder: RpcResponder) => {
  return {
    start: async (options: SmoldotOptions): Promise<SmoldotClient> => {
      return Promise.resolve({
        // fake the async reply by using the reponder to format
        // a reply via options.json_rpc_callback
        send_json_rpc: fakeRpcSendForSubscription(options, responder)
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
  save(state: string) {}
  delete() {}
}
const testDb = () => new TestDatabase();

test('connect resolves and emits', async t => {
  const ms = mockSmoldot(x => x);
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, testDb(), ms);
  let connectedEmitted = false;

  provider.on('connected', () => { connectedEmitted = true; });
  await provider.connect();
  t.true(connectedEmitted);
  t.true(provider.isConnected);
});

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
  }
});

// response has no method field
// handler was not registered by `subscribe` I.E. has no associated `subscription`
test('awaiting send returns message result', async t => {
  const mockResponses =  ['{ "id": 1, "jsonrpc": "2.0", "result": "success" }'];
  const ms = mockSmoldot(respondWith(mockResponses));
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, testDb(), ms);

  await provider.connect();
  const reply = await provider.send('hello', [ 'world' ]);
  t.is(reply, 'success');
});

test('send formats JSON RPC request correctly', async t => {
  // don't really care what the reply is
  const mockResponses =  ['{ "id": 1, "jsonrpc": "2.0", "result": "success" }'];
  const rpcSend = sinon.spy();
  const ss = smoldotSpy(respondWith(mockResponses), rpcSend);
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, testDb(), ss);

  await provider.connect();
  const reply = await provider.send('hello', [ 'world' ]);
  t.true(rpcSend.called);
  const rpcJson = rpcSend.firstCall.firstArg;
  t.is(rpcJson, '{"id":1,"jsonrpc":"2.0","method":"hello","params":["world"]}');
});

test('sending twice uses new id', async t => {
  // don't really care what the replies are
  const mockResponses =  [ 
    '{ "id": 1, "jsonrpc": "2.0", "result": "success" }',
    '{ "id": 2, "jsonrpc": "2.0", "result": "success" }'
  ];
  const rpcSend = sinon.spy();
  const ss = smoldotSpy(respondWith(mockResponses), rpcSend);
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
});

test('throws when got error JSON response', async t => {
  const mockResponses =  [
    '{ "id": 1, "jsonrpc": "2.0", "error": {"code": 666, "message": "boom!" } }'
  ];
  const ms = mockSmoldot(respondWith(mockResponses));
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, testDb(), ms);

  await provider.connect();
  await t.throwsAsync(async () => {
    await provider.send('hello', [ 'world' ]);
  }, {instanceOf: Error, message: '666: boom!'});
});

test('send can also add subscriptions and returns an id', async t => {
  const ms = mockSmoldot(respondWith(['{ "id": 1, "jsonrpc": "2.0", "result": 1  }']));
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, testDb(), ms);

  await provider.connect();
  const reply = await provider.send('test_sub', []);
  t.is(reply, 1);
});

test('subscribe', async t => {
  const responses = [
    '{"jsonrpc":"2.0","result":"SUBSCRIPTIONID","id":1}',
    '{"jsonrpc":"2.0","method":"state_testSub","params":{"result":{"dummy":"state"},"subscription":"SUBSCRIPTIONID"}}'
  ];
  const ms = mockSmoldotForSubscription(respondWith(responses));
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, testDb(), ms);

  await provider.connect();

  t.plan(2);
  return new Promise<void>((resolve, reject) => {
    return provider.subscribe('state_testSub', 'test_sub', [],  (error: Error | null, result: any) => {
      if (error !== null) {
        t.fail(error.message);
        reject();
      }

      t.deepEqual(result, { dummy: "state" });
      resolve();
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
  const ms = mockSmoldotForSubscription(respondWith(responses));
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
      resolve();
    }).then(reply => {
      t.is(reply, "SUBSCRIPTIONID");
    });
  });
});

test('unsubscribe fails when sub not found', async t => {
  const subscriptionResponses = [
    '{ "id": 1, "jsonrpc": "2.0", "result": 1  }'
  ];
  const ms = mockSmoldot(respondWith(subscriptionResponses));
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, testDb(), ms);

  await provider.connect();
  await provider.subscribe('test', 'subscribe_test', [], () => {});
  const reply =  await provider.unsubscribe('test', 'subscribe_test', 666);

  t.false(reply);
});

test('unsubsubscribe removes subscriptions', async t => {
  const subscriptionResponses = [
    '{ "id": 1, "jsonrpc": "2.0", "result": 1 }',
    '{ "id": 2, "jsonrpc": "2.0", "result": true }'
  ];
  const ms = mockSmoldot(respondWith(subscriptionResponses));
  const provider = new SmoldotProvider(EMPTY_CHAIN_SPEC, testDb(), ms);

  await provider.connect();
  const id = await provider.subscribe('test', 'subscribe_test', [], () => {});
  const reply =  await provider.unsubscribe('test', 'subscribe_test', id);
  t.true(reply);
});
