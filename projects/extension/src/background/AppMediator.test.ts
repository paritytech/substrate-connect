/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */
import { AppMediator } from './AppMediator';
import { SmoldotChain } from '@substrate/smoldot-light';
import { 
  MockPort, 
  MockConnectionManager,
  ErroringMockConnectionManager
} from '../mocks';

let port: MockPort;
let manager: MockConnectionManager;
let appMed: AppMediator;
  
const waitForMessageToBePosted = (): Promise<null> => {
  // window.postMessge is async so we must do a short setTimeout to yield to
  // the event loop
  return new Promise(resolve => setTimeout(resolve, 10, null));
}

beforeEach(() => {
  port = new MockPort('test-app::westend');
  manager = new MockConnectionManager();
  appMed = new AppMediator(port, manager);
});

test('Construction parses the port name and gets port information', () => {
  expect(appMed.name).toBe('test-app::westend');
  expect(appMed.appName).toBe('test-app');
  expect(appMed.url).toBe(port.sender.url);
  expect(appMed.tabId).toBe(port.sender.tab.id);
  expect(appMed.state).toEqual('connected');
});

test('Invalid port name sends an error and disconnects', () => {
  port = new MockPort('invalid');
  manager = new MockConnectionManager();

  expect(() => {
    new AppMediator(port, manager);
  }).toThrow();

  const errorMsg = { 
    type: 'error', 
    payload: 'Invalid port name invalid expected <app_name>::<chain_name>'
  };
  expect(port.postMessage).toHaveBeenCalledWith(errorMsg);
  expect(port.disconnect).toHaveBeenCalled();
});

// TODO: This is not right we should have a new 'connecting' state until we get
// the spec message and check the transition 'connecting' -> 'connected'
test('Connected state', () => {
  port.triggerMessage({ type: 'spec', payload: 'westend'});
  port.triggerMessage({ type: 'rpc', payload: '{ "id": 1 }'});
  expect(appMed.state).toBe('connected');
});
  
test('Disconnect cleans up properly', async () => {
  port.triggerMessage({ type: 'spec', payload: 'westend'});
  await waitForMessageToBePosted();
  appMed.disconnect();
  expect(appMed.state).toBe('disconnected');
  expect(manager.unregisterApp).toHaveBeenCalled();
  const chain = appMed.chain as SmoldotChain;
  expect(chain.remove).toHaveBeenCalled();
});

test('Spec message adds a chain', async () => {
  port.triggerMessage({ type: 'spec', payload: 'westend'});
  await waitForMessageToBePosted();

  expect(appMed.chain).toBeDefined();
});

test('Buffers RPC messages before spec message', async () => {
  const message1 = JSON.stringify({ id: 1, jsonrpc: '2.0', result: {} });
  port.triggerMessage({ type: 'rpc', payload: message1 });
  const message2 = JSON.stringify({ id: 2, jsonrpc: '2.0', result: {} });
  port.triggerMessage({ type: 'rpc', payload: message2 });

  port.triggerMessage({ type: 'spec', payload: 'westend'});
  await waitForMessageToBePosted();

  expect(appMed.chain).toBeDefined();
  const chain = appMed.chain as SmoldotChain;
  expect(chain.sendJsonRpc).toHaveBeenCalledTimes(2);
  expect(chain.sendJsonRpc).toHaveBeenCalledWith(message1);
  expect(chain.sendJsonRpc).toHaveBeenLastCalledWith(message2);
});

test('RPC port message sends the message to the chain', async () => {
  port.triggerMessage({ type: 'spec', payload: 'westend'});
  await waitForMessageToBePosted();
  const message = JSON.stringify({ id: 1, jsonrpc: '2.0', result: {} });
  port.triggerMessage({ type: 'rpc', payload: message});
  await waitForMessageToBePosted();

  const chain = appMed.chain as SmoldotChain;
  expect(chain.sendJsonRpc).toHaveBeenCalledWith(message);
});

test('Failing to add a chain sends an error and disconnects', async () => {
  port = new MockPort('test-app::westend');
  manager = new ErroringMockConnectionManager();
  appMed = new AppMediator(port, manager);

  port.triggerMessage({ type: 'spec', payload: 'westend'});
  await waitForMessageToBePosted();

  const errorMsg = { type: 'error', payload: 'Invalid chain spec' };
  expect(port.postMessage).toHaveBeenCalledWith(errorMsg);
  expect(port.disconnect).toHaveBeenCalled();
  expect(manager.unregisterApp).toHaveBeenCalled();
});
