/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { jest } from '@jest/globals';
import { AppMediator } from './AppMediator';
import { MockPort, MockConnectionManager } from '../mocks';
import { JsonRpcResponse } from './types';

function setupAppMediatorWithSubscription(
  am: AppMediator,
  port: MockPort,
  appIDForRequest: number,
  subID: number,
  spyPortPostMessage: unknown) {
  const prevRequestCount = am.cloneRequests().length;
  const prevSubCount = am.cloneSubscriptions().length;

  // Fake a message with an RPC request to add a subscription
  port.triggerMessage({
    type: 'rpc',
    payload: `{"id":${appIDForRequest},"jsonrpc":"2.0","method":"system_health","params":[]}`,
    subscription: true
  });

  // Should have a request mapping and a subscription mapping with no mapped subID yet
  const pendingRequests = am.cloneRequests();
  expect(pendingRequests.length).toBe(prevRequestCount + 1);
  expect(am.cloneSubscriptions().length).toBe(prevSubCount + 1);
  expect(am.cloneSubscriptions()[prevSubCount])
    .toEqual({ appIDForRequest, subID: undefined, method: 'system_health' });

  // Fake receiving an RPC response to the subscription request
  const message: JsonRpcResponse = {
    id: pendingRequests[pendingRequests.length - 1].smoldotID,
    jsonrpc: '2.0',
    result: subID
  };
  am.processSmoldotMessage(message);

  // Should have removed the request mapping and updated the subscription
  expect(am.cloneRequests().length).toBe(prevRequestCount);
  expect(am.cloneSubscriptions()[prevSubCount])
    .toEqual({ appIDForRequest, subID, method: 'system_health' });

  // should send the acknowledgement of the subscription request back to the UApp
  expect(spyPortPostMessage).toHaveBeenCalledWith({ type: 'rpc', payload: `{"id":${appIDForRequest},"jsonrpc":"2.0","result":${subID}}`});
}

describe("Test AppMediator class", () => {
  let port: MockPort;
  let manager: MockConnectionManager;
  let appMed: AppMediator;
  let spyManagerRegisterApp: unknown;
  let spyManagerUnregisterApp: unknown;
  let spyPortPostMessage: unknown;
  let spyPortDisconnect: unknown;
  
  const initFunc = (portStr: string, connManagerFlag: boolean) => {
    port = new MockPort(portStr);
    manager = new MockConnectionManager(connManagerFlag);
    appMed = new AppMediator(port, manager);
    spyManagerRegisterApp = jest.spyOn(manager, 'registerApp');
    spyManagerUnregisterApp = jest.spyOn(manager, 'unregisterApp');
    spyPortDisconnect = jest.spyOn(port, 'disconnect');
    spyPortPostMessage = jest.spyOn(port, 'postMessage');
  }

  test('Initialization and getters', () => {
    initFunc('test-app::westend', true);
    expect(appMed.name).toBe('test-app::westend');
    expect(appMed.appName).toBe('test-app');
    expect(appMed.url).toBe(port.sender.url);
    expect(appMed.tabId).toBe(port.sender.tab.id);
    expect(appMed.subscriptions).toEqual([]);
    expect(appMed.requests).toEqual([]);
    expect(appMed.state).toEqual('connected');
  });

  test('Connected  with client and can send messages', () => {
    initFunc('test-app::westend', true);
    port.triggerMessage({ type: 'rpc', payload: '{ "id": 1 }'});
    expect(appMed.requests.length).toBe(1);
    expect(appMed.state).toBe('connected');
  });
  
  test('Test associate', () => {
    initFunc('test-app::westend', true);
    const result = appMed.associate();
    expect(result).toBe(true);
    expect(spyManagerRegisterApp).toHaveBeenCalled();
  });

  test('Connect but given invalid port name', () => {
    initFunc('test-appwestend', false);
    const result = appMed.associate();
    expect(result).toBe(false);
    expect(spyPortDisconnect).toHaveBeenCalled();
    expect(spyManagerRegisterApp).not.toHaveBeenCalled();
    expect(spyPortPostMessage).toHaveBeenCalledWith({ type: 'error', payload: `Invalid port name test-appwestend expected <app_name>::<chain_name>`});
  });

  test('Try to connect but extension does not have client', () => {
    initFunc('test-app::westend', false);
    const result = appMed.associate();
    expect(result).toBe(false);
    expect(spyPortDisconnect).toHaveBeenCalled();
    expect(spyManagerRegisterApp).not.toHaveBeenCalled();
    expect(spyPortPostMessage).toHaveBeenCalledWith({ type: 'error', payload: `Extension does not have client for westend`});
  });

  test('Disconnect: happy path', () => {
    initFunc('test-app::westend', true);
    appMed.disconnect();
    expect(appMed.state).toBe('disconnected');
    expect(spyManagerUnregisterApp).toHaveBeenCalled();
  });

  describe('ProcessSmoldotMessage tests', () => {
    test('ProcessSmoldotMessage: happy path', () => {
      initFunc('test-app::westend', true);
      port.triggerMessage({ type: 'rpc', payload: '{ "id": 1 }'});
      const message: JsonRpcResponse = { id: 1, jsonrpc: '2.0', result: {} };
      const result = appMed.processSmoldotMessage(message);
      expect(result).toBe(true);
    });

    test('ProcessSmoldotMessage: request is undefined', () => {
      initFunc('test-app::westend', true);
      const message: JsonRpcResponse = { id: 1, jsonrpc: '2.0', result: {} };
      const result = appMed.processSmoldotMessage(message);
      expect(result).toBe(false);
    });

    test('ProcessSmoldotMessage: return false when app is disconnected', () => {
      console.error = jest.fn()
      initFunc('test-app::westend', true);
      const message: JsonRpcResponse = { id: 1, jsonrpc: '2.0', result: {} };
      appMed.disconnect();
      const result = appMed.processSmoldotMessage(message);
      expect(result).toBe(false);
      expect(console.error).toBeCalledTimes(1);
      expect(console.error).toBeCalledWith('Asked a disconnected UApp (test-app::westend) to process a message from undefined');

    });

    test('ProcessSmoldotMessage: does nothing when it has sent no requests', () => {
      initFunc('test-app::westend', true);    
      const message: JsonRpcResponse = { id: 1, jsonrpc: '2.0', result: {} };
      const result = appMed.processSmoldotMessage(message);
      expect(result).toBe(false);
    });

    test('ProcessSmoldotMessage: remaps the id to the apps id', () => {
      initFunc('test-app::kusama', true);    
      
      // Fake getting a request from UApp to send an RPC message
      port.triggerMessage({
        type: 'rpc',
        payload: '{"id":1,"jsonrpc":"2.0","method":"state_getStorage","params":["<hash>"]}'
      });
    
      // Fake an RPC response to the request
      const message: JsonRpcResponse = { id: manager.lastId, jsonrpc: '2.0', result: {} };
      expect(appMed.processSmoldotMessage(message)).toBe(true);
      // should have posted the message back to the UApp with the mapped ID
      expect(spyPortPostMessage).toHaveBeenCalledWith({ type: 'rpc', payload: '{"id":1,"jsonrpc":"2.0","result":{}}'});
    });
  });

  test('Tracks and forwards subscriptions', () => {
    initFunc('test-app::westend', true);

    const appIDForRequest = 1
    const subscriptionId = 2;
    setupAppMediatorWithSubscription(appMed, port, appIDForRequest, subscriptionId, spyPortPostMessage);

    // Fake receiving an RPC message for the subscription
    const subMessage = {
      jsonrpc: '2.0',
      method: 'system_health',
      params: { subscription: subscriptionId, result: "subscription value" }
    };
    expect(appMed.processSmoldotMessage(subMessage)).toBe(true);

    // should send subcription message back to the UApp unchanged
    expect(spyPortPostMessage)
      .toHaveBeenCalledWith({ type: 'rpc', payload: JSON.stringify(subMessage)});

    // Fake receiving an RPC message with a subscription ID that is not one of
    // our subscriptions
    const subMessage2 = {
      jsonrpc: '2.0',
      method: 'system_health',
      params: { subscription: 666, result: "subscription value" }
    };
    // shouldnt process it
    expect(appMed.processSmoldotMessage(subMessage2)).toBe(false);
  });

  test('Unsubscribes from all subs on disconnect', () => {
    initFunc('test-app::westend', true);

    setupAppMediatorWithSubscription(appMed, port, 1, 1, spyPortPostMessage);
    setupAppMediatorWithSubscription(appMed, port, 2, 2, spyPortPostMessage);

    port.triggerDisconnect();
    expect(appMed.state).toBe('disconnecting');
    let pendingRequests = appMed.cloneRequests();
    expect(pendingRequests.length).toBe(2);

    // First unsub repsonse
    const unsub1 = { jsonrpc:'2.0', id: pendingRequests[0].smoldotID, result: true };
    expect(appMed.processSmoldotMessage(unsub1)).toBe(true);
    expect(appMed.state).toBe('disconnecting');
    pendingRequests = appMed.cloneRequests();
    expect(pendingRequests.length).toBe(1);

    // Second unsub repsonse
    const unsub2 = { jsonrpc:'2.0', id: pendingRequests[0].smoldotID, result: true };
    expect(appMed.processSmoldotMessage(unsub2)).toBe(true);
    expect(appMed.state).toBe('disconnected');
    pendingRequests = appMed.cloneRequests();
    expect(pendingRequests.length).toBe(0);
  });
});
