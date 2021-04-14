import { jest } from '@jest/globals';
import { ExtensionMessageRouter } from './ExtensionMessageRouter';
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

test('associate establishes a port', done => {
  chrome.runtime.connect.mockImplementation(_ => new MockPort('test-app::westend'));
  window.postMessage({ 
      appName: 'test-app', 
      chainName: 'westend', 
      message: {
        type: 'associate',
        payload: 'westend'
      },
      origin: 'extension-provider'
    }, '*');

    // window.postMessage is async we have to yield to the event loop for it
    // to reach the router
    setTimeout(() => {
      expect(chrome.runtime.connect).toHaveBeenCalledTimes(1);
      expect(router.connections.length).toBe(1);
      expect(router.connections[0]).toBe('westend');
      done();
    }, 10);
});

test('incorrect origin does nothing to connections', done => {
  window.postMessage({ 
      origin: 'something-else'
    }, '*');

    // window.postMessage is async we have to yield to the event loop for it
    // to reach the router
    setTimeout(() => {
      expect(chrome.runtime.connect).not.toHaveBeenCalled();
      expect(router.connections.length).toBe(0);
      done();
    }, 10);
});

test('disconnect disconnects established connection', done => {
  const port = new MockPort('test-app::westend');
  chrome.runtime.connect.mockImplementation(_ => port);
  window.postMessage({ 
      appName: 'test-app', 
      chainName: 'westend', 
      message: {
        type: 'associate',
        payload: 'westend'
      },
      origin: 'extension-provider'
    }, '*');
  window.postMessage({ 
      appName: 'test-app', 
      chainName: 'westend', 
      message: 'disconnect',
      origin: 'extension-provider'
    }, '*');


    // window.postMessage is async we have to yield to the event loop for it
    // to reach the router
    setTimeout(() => {
      expect(chrome.runtime.connect).toHaveBeenCalledTimes(1);
      expect(port.disconnect).toHaveBeenCalledTimes(1);
      expect(router.connections.length).toBe(0);
      done();
    }, 10);
});

test('forwards rpc message from extension provider', done => {
  const port = new MockPort('test-app::westend');
  chrome.runtime.connect.mockImplementation(_ => port);
  // connect
  window.postMessage({ 
    appName: 'test-app', 
    chainName: 'westend', 
    message: {
      type: 'associate',
      payload: 'westend'
    },
    origin: 'extension-provider'
  }, '*');

  // rpc
  const rpcMessage = { 
    appName: 'test-app', 
    chainName: 'westend', 
    message: {
      type: 'rpc',
      payload: '{"id":1,"jsonrpc":"2.0","method":"state_getStorage","params":["<hash>"]}' 
    },
    origin: 'extension-provider'
  };

  window.postMessage(rpcMessage, '*');

  // window.postMessage is async we have to yield to the event loop for it
  // to reach the router
  setTimeout(() => {
    expect(chrome.runtime.connect).toHaveBeenCalledTimes(1);
    expect(port.disconnect).not.toHaveBeenCalled();
    expect(port.postMessage).toHaveBeenCalledWith(rpcMessage.message);
    done();
  }, 10);
});

