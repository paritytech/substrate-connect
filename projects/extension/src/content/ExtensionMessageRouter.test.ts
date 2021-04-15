import { jest } from '@jest/globals';
import { ExtensionMessageRouter } from './ExtensionMessageRouter';
import { ExtensionMessage } from '../types';
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

function waitForMessageToBePosted(): Promise<null> {
  // window.postMessge is async so we must do a short setTimeout to yield to
  // the event loop
  return new Promise(resolve => setTimeout(resolve, 10, null));
}

test('associate establishes a port', async () => {
  chrome.runtime.connect.mockImplementation(_ => new MockPort('test-app::westend'));
  window.postMessage({
    appName: 'test-app',
    chainName: 'westend',
    action: 'forward',
    message: { type: 'associate', payload: 'westend' },
    origin: 'extension-provider'
  }, '*');

  await waitForMessageToBePosted();
  expect(chrome.runtime.connect).toHaveBeenCalledTimes(1);
  expect(router.connections.length).toBe(1);
  expect(router.connections[0]).toBe('westend');
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
  window.postMessage({
    appName: 'test-app',
    chainName: 'westend',
    action: 'forward',
    message: { type: 'associate', payload: 'westend' },
    origin: 'extension-provider'
  }, '*');
  await waitForMessageToBePosted();

  window.postMessage({
    appName: 'test-app',
    chainName: 'westend',
    action: 'disconnect',
    origin: 'extension-provider'
  }, '*');
  await waitForMessageToBePosted();


  expect(chrome.runtime.connect).toHaveBeenCalledTimes(1);
  expect(port.disconnect).toHaveBeenCalledTimes(1);
  expect(router.connections.length).toBe(0);
});

test('forwards rpc message from app -> extension', async () => {
  const port = new MockPort('test-app::westend');
  chrome.runtime.connect.mockImplementation(_ => port);
  // connect
  window.postMessage({
    appName: 'test-app',
    chainName: 'westend',
    action: 'forward',
    message: { type: 'associate', payload: 'westend' },
    origin: 'extension-provider'
  }, '*');
  await waitForMessageToBePosted();

  // rpc
  const rpcMessage = {
    appName: 'test-app',
    chainName: 'westend',
    action: 'forward',
    message: {
      type: 'rpc',
      payload: '{"id":1,"jsonrpc":"2.0","method":"state_getStorage","params":["<hash>"]}'
    },
    origin: 'extension-provider'
  };
  window.postMessage(rpcMessage, '*');
  await waitForMessageToBePosted();

  expect(chrome.runtime.connect).toHaveBeenCalledTimes(1);
  expect(port.disconnect).not.toHaveBeenCalled();
  expect(port.postMessage).toHaveBeenCalledWith(rpcMessage.message);
});

test('forwards rpc message from extension -> app', async () => {
  const port = new MockPort('test-app::westend');
  chrome.runtime.connect.mockImplementation(_ => port);
  // connect
  window.postMessage({
    appName: 'test-app',
    chainName: 'westend',
    action: 'forward',
    message: { type: 'associate', payload: 'westend' },
    origin: 'extension-provider'
  }, '*');
  await waitForMessageToBePosted();

  const handler = jest.fn();
  window.addEventListener('message', handler);
  const message: ExtensionMessage = { type: 'rpc', payload: '{"id:":1,"jsonrpc:"2.0","result":666}' };
  port.triggerMessage(message);
  await waitForMessageToBePosted();

  interface RouterMessage {
    data: ExtensionMessage
  }

  expect(chrome.runtime.connect).toHaveBeenCalledTimes(1);
  expect(port.disconnect).not.toHaveBeenCalled();
  expect(handler).toHaveBeenCalled();
  const forwarded = handler.mock.calls[0][0] as RouterMessage;
  expect(forwarded.data).toEqual({ origin: 'content-script', message: message.payload });
});

