import test from 'ava';
import sinon from 'sinon';
import { SmoldotProvider } from './SmoldotProvider';
import { SmoldotClient, SmoldotOptions } from 'smoldot';

type RpcResponder = (message: string) => string;

const fakeRpcSend = (options: SmoldotOptions, responder: RpcResponder) => {
  return (rpc: string) => {
    process.nextTick(() => options.json_rpc_callback(responder(rpc)));
  };
}

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
    const replyJson =  '{ "id": 1, "jsonrpc": "2.0", "result": "success" }';
    const ms = mockSmoldot(_ => replyJson);
    const provider = new SmoldotProvider("", ms);

    await provider.connect();
    const reply = await provider.send('hello', [ 'world' ]);
    t.is(reply, 'success');
});

test('send formats JSON RPC request correctly', async t => {
    // we don't really care what the reply is for this test
    const replyJson =  '{ "id": 1, "jsonrpc": "2.0", "result": "success" }';
    const rpcSend = sinon.spy();
    const ss = smoldotSpy(_ => replyJson, rpcSend);
    const provider = new SmoldotProvider("", ss);

    await provider.connect();
    const reply = await provider.send('hello', [ 'world' ]);
    t.true(rpcSend.called);
    const rpcJson = rpcSend.firstCall.firstArg;
    t.is(rpcJson, '{"id":1,"jsonrpc":"2.0","method":"hello","params":["world"]}');
});

