import { jest } from '@jest/globals';
import { SmoldotClient} from 'smoldot';
import {
  smoldotSpy,
  respondWith
} from '@substrate/smoldot-test-utils';
import { SmoldotMediator } from './SmoldotMediator';
import { JsonRpcRequest, JsonRpcResponse } from './types';
import westend from '../../public/assets/westend.json';
import { AppMediator } from './AppMediator';
import { MockPort, MockConnectionManager } from '../mocks';

let sc: SmoldotClient;
let sm: SmoldotMediator;
let appMed: AppMediator;
let spyScSendJsonRpc: unknown;
let spyScTerminate: unknown;
let message:JsonRpcRequest;
let idReturned: number;

const createMessage = (id: number): JsonRpcRequest => ({
  id: id,
  jsonrpc: '2.0',
  method: 'something',
  params: []
});

beforeEach(async () => {
  const responses =  [
    '{ "id": 1, "jsonrpc": "2.0", "result": "success" }',
    '{ "id": 2, "jsonrpc": "2.0", "result": "success" }',
    '{ "id": 3, "jsonrpc": "2.0", "result": "success" }'
  ];
  const rpcSend = jest.fn() as jest.MockedFunction<(rpc: string, chainIndex: number) => void>;
  sc = await smoldotSpy(respondWith(responses), rpcSend).start({
    chainSpecs: [JSON.stringify(westend)],
    maxLogLevel: 3,
    jsonRpcCallback: (message: string) => {
      const parsed = JSON.parse(message) as JsonRpcResponse;
      for (const app of sm.apps) {
        if (app.processSmoldotMessage(parsed)) {
          break;
        }
      }
    }
  });
  sm = new SmoldotMediator('westend', sc);
  spyScSendJsonRpc = jest.spyOn(sc, 'sendJsonRpc');
  spyScTerminate = jest.spyOn(sc, 'terminate');
});

afterEach(() => {
  jest.clearAllMocks();
  sm.shutdown();
});

test('Test addApp', () => {
  const port = new MockPort('test-app::westend');
  const manager = new MockConnectionManager(true);
  appMed = new AppMediator(port, manager);
  sm.addApp(appMed);
  expect(sm.apps).toHaveLength(1);
});

test('Test correctness of sendRpcMessage', () => {
  // at this point this.#id is 0; create a message with id: 1 and expect to receive id = 1
  message = createMessage(1);
  idReturned = sm.sendRpcMessage(message); // now on return it must be 1
  expect(spyScSendJsonRpc).toHaveBeenCalledTimes(1);
  expect(idReturned).toBe(1);
  expect(spyScSendJsonRpc).toHaveBeenCalledWith("{\"id\":1,\"jsonrpc\":\"2.0\",\"method\":\"something\",\"params\":[]}", 0);
});

test('Test remapping of id on sendRpcMessage', () => {
  // at this point this.#id is 1; create a message with id: 2 and expect to receive id = 2
  message = createMessage(1);
  idReturned = sm.sendRpcMessage(message);
  expect(idReturned).toBe(1);
  expect(spyScSendJsonRpc).toHaveBeenNthCalledWith(1, "{\"id\":1,\"jsonrpc\":\"2.0\",\"method\":\"something\",\"params\":[]}", 0);

  // at this point this.#id is 2; Send some id (other than next one) in order to ensure that next one (id: 3) will be used
  message = createMessage(255);
  idReturned = sm.sendRpcMessage(message);
  expect(idReturned).toBe(2);
  expect(spyScSendJsonRpc).toHaveBeenNthCalledWith(2, "{\"id\":2,\"jsonrpc\":\"2.0\",\"method\":\"something\",\"params\":[]}", 0);
});

test('Test removeApp', () => {
  sm.removeApp(appMed);
  expect(sm.apps).toHaveLength(0);
});

test('Test shutdown', () => {
  sm.shutdown();
  expect(spyScTerminate).toHaveBeenCalledTimes(1);
});
