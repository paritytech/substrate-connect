import test from 'ava';
import sinon from 'sinon';
import { SmoldotProvider } from './SmoldotProvider';
import { SmoldotClient, SmoldotOptions } from 'smoldot';

type RpcResponder = (message: string) => string;

// Mimics the behaviour of the WASM light client by deferring a call to 
// `json_rpc_callback` after it is called which returns the response
// returned by the supplied `responder`.
const fakeRpcSend = (options: SmoldotOptions, responder: RpcResponder) => {
  return (rpc: string) => {
    process.nextTick(() => options.json_rpc_callback(responder(rpc)));
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
                json_rpc_send: fakeRpcSend(options, responder)
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
                json_rpc_send: (rpc: string) => {
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

test('connect resolves and emits', async t => {
    const echoSmoldot = mockSmoldot(x => x);
    const provider = new SmoldotProvider("", echoSmoldot);
    let connectedEmitted = false;

    provider.on('connected', () => { connectedEmitted = true; });
    await provider.connect();
    t.true(connectedEmitted);
    t.true(provider.isConnected);

});

// response has no method field
// handler was not registered by `subscribe` I.E. has no associated `subscription`
test('awaiting send returns message result', async t => {
    const mockResponses =  ['{ "id": 1, "jsonrpc": "2.0", "result": "success" }'];
    const ms = mockSmoldot(respondWith(mockResponses));
    const provider = new SmoldotProvider("", ms);

    await provider.connect();
    const reply = await provider.send('hello', [ 'world' ]);
    t.is(reply, 'success');
});

test('send formats JSON RPC request correctly', async t => {
    // don't really care what the reply is
    const mockResponses =  ['{ "id": 1, "jsonrpc": "2.0", "result": "success" }'];
    const rpcSend = sinon.spy();
    const ss = smoldotSpy(respondWith(mockResponses), rpcSend);
    const provider = new SmoldotProvider("", ss);

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
    const provider = new SmoldotProvider("", ss);

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
    const mockResponses =  ['{ "id": 1, "jsonrpc": "2.0", "error": {"code": 666, "message": "boom!" } }'];
    const ms = mockSmoldot(respondWith(mockResponses));
    const provider = new SmoldotProvider("", ms);

    await provider.connect();
    await t.throwsAsync(async () => {
      await provider.send('hello', [ 'world' ]);
    }, {instanceOf: Error, message: '666: boom!'});
});

test('send can also add subscriptions and returns an id', async t => {
    const ms = mockSmoldot(respondWith(['{ "id": 1, "jsonrpc": "2.0", "result": 1  }']));
    const provider = new SmoldotProvider("", ms);

    await provider.connect();
    const reply = await provider.send('test_sub', []);
    t.is(reply, 1);
});
