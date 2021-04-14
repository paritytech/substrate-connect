/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';
import { ExtensionMessageRouter } from './ExtensionMessageRouter';
import { MockPort } from '../mocks';
import { chrome } from 'jest-chrome';

test('associate establishes a port', done => {
  const router = new ExtensionMessageRouter();
  router.listen();
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
