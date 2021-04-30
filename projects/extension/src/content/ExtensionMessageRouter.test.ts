import { jest } from '@jest/globals';
import { ExtensionMessageRouter } from './ExtensionMessageRouter';
import { 
  ProviderMessage, 
  ProviderMessageData, 
  MessageFromManager,
  ExtensionMessage,
  ExtensionMessageData,
  provider
} from '@substrate/connect-extension-protocol';
import { MockPort } from '../mocks';
import { chrome } from 'jest-chrome';

let router: ExtensionMessageRouter;

beforeEach(() => {
  chrome.runtime.connect.mockClear();
  router = new ExtensionMessageRouter();
  router.listen();
});

afterEach(() => {
  router.stop();
});

const waitForMessageToBePosted = (): Promise<null> => {
  // window.postMessge is async so we must do a short setTimeout to yield to
  // the event loop
  return new Promise(resolve => setTimeout(resolve, 10, null));
}

test('connect establishes a port', async () => {
  chrome.runtime.connect.mockImplementation(_ => new MockPort('test-app::westend'));
  provider.send({
    appName: 'test-app',
    chainName: 'westend',
    action: 'connect',
    origin: 'extension-provider'
  });

  await waitForMessageToBePosted();
  expect(chrome.runtime.connect).toHaveBeenCalledTimes(1);
  expect(router.connections.length).toBe(1);
  expect(router.connections[0]).toBe('westend');
});

test('port disconnecting sends disconnect message and removes port', async () => {
  const port = new MockPort('test-app::westend');
  chrome.runtime.connect.mockImplementation(_ => port);
  provider.send({
    appName: 'test-app',
    chainName: 'westend',
    action: 'connect',
    origin: 'extension-provider'
  });
  await waitForMessageToBePosted();

  const handler = jest.fn();
  provider.listen(handler);
  port.triggerDisconnect();
  await waitForMessageToBePosted();

  const expectedMessage: ExtensionMessageData = {
    origin: 'content-script',
    disconnect: true
  };
  expect(router.connections.length).toBe(0);
  const { data } = handler.mock.calls[0][0] as ExtensionMessage;
  expect(data).toEqual(expectedMessage);
});

test('incorrect origin does nothing to connections', async () => {
  window.postMessage({
    origin: 'something-else'
  }, '*');

  await waitForMessageToBePosted();
  expect(chrome.runtime.connect).not.toHaveBeenCalled();
  expect(router.connections.length).toBe(0);
});

test('disconnect disconnects established connection', async () => {
  const port = new MockPort('test-app::westend');
  chrome.runtime.connect.mockImplementation(_ => port);
  provider.send({
    appName: 'test-app',
    chainName: 'westend',
    action: 'connect',
    origin: 'extension-provider'
  });
  await waitForMessageToBePosted();

  provider.send({
    appName: 'test-app',
    chainName: 'westend',
    action: 'disconnect',
    origin: 'extension-provider'
  });
  await waitForMessageToBePosted();


  expect(chrome.runtime.connect).toHaveBeenCalledTimes(1);
  expect(port.disconnect).toHaveBeenCalledTimes(1);
  expect(router.connections.length).toBe(0);
});

test('forwards rpc message from app -> extension', async () => {
  const port = new MockPort('test-app::westend');
  chrome.runtime.connect.mockImplementation(_ => port);
  // connect
  provider.send({
    appName: 'test-app',
    chainName: 'westend',
    action: 'connect',
    origin: 'extension-provider'
  });
  await waitForMessageToBePosted();

  // rpc
  const rpcMessage: ProviderMessageData = {
    appName: 'test-app',
    chainName: 'westend',
    action: 'forward',
    message: {
      type: 'rpc',
      payload: '{"id":1,"jsonrpc":"2.0","method":"state_getStorage","params":["<hash>"]}'
    },
    origin: 'extension-provider'
  };
  provider.send(rpcMessage);
  await waitForMessageToBePosted();

  expect(chrome.runtime.connect).toHaveBeenCalledTimes(1);
  expect(port.disconnect).not.toHaveBeenCalled();
  expect(port.postMessage).toHaveBeenCalledWith(rpcMessage.message);
});

test('forwards rpc message from extension -> app', async () => {
  const port = new MockPort('test-app::westend');
  chrome.runtime.connect.mockImplementation(_ => port);
  // connect
  provider.send({
    appName: 'test-app',
    chainName: 'westend',
    action: 'connect',
    origin: 'extension-provider'
  });
  await waitForMessageToBePosted();

  const handler = jest.fn();
  window.addEventListener('message', handler);
  const message: MessageFromManager = { type: 'rpc', payload: '{"id:":1,"jsonrpc:"2.0","result":666}' };
  port.triggerMessage(message);
  await waitForMessageToBePosted();

  expect(chrome.runtime.connect).toHaveBeenCalledTimes(1);
  expect(port.disconnect).not.toHaveBeenCalled();
  expect(handler).toHaveBeenCalled();
  const forwarded = handler.mock.calls[0][0] as ExtensionMessage;
  expect(forwarded.data).toEqual({ origin: 'content-script', message: message });
});

test('forwards error message from extension -> app', async () => {
  const port = new MockPort('test-app::westend');
  chrome.runtime.connect.mockImplementation(_ => port);
  // connect
  window.postMessage({
    appName: 'test-app',
    chainName: 'westend',
    action: 'connect',
    origin: 'extension-provider'
  }, '*');
  await waitForMessageToBePosted();

  const handler = jest.fn();
  window.addEventListener('message', handler);
  const errorMessage: MessageFromManager = { type: 'error', payload: 'Boom!' };
  port.triggerMessage(errorMessage);
  await waitForMessageToBePosted();

  expect(handler).toHaveBeenCalled();
  const forwarded = handler.mock.calls[0][0] as ExtensionMessage;
  expect(forwarded.data).toEqual({ origin: 'content-script', message: errorMessage });
});

