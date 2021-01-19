import test from 'ava';
import { SmoldotProvider } from './SmoldotProvider';
import { SmoldotClient, SmoldotOptions } from 'smoldot';

const messages: Array<string> = [];

type RpcResponder = (message: string) => string;

const mockSmoldot = (responder: RpcResponder) => {
    return {
        start: async (options: SmoldotOptions): Promise<SmoldotClient> => {
            return Promise.resolve({
                json_rpc_send(rpc: string) {
                    process.nextTick(() => { options.json_rpc_callback(responder(rpc)); });
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

/*
test('returns message response', async t => {
    const echoSmoldot = mockSmoldot(x => x);
    const provider = new SmoldotProvider("", echoSmoldot);

    //const reply = await provider.send('hello');
});
*/
