/**
 * @jest-environment jsdom
 */

import { ExtensionMessage } from '../types';
import { AppMediator } from './AppMediator';
import { MockPort, MockConnectionManager } from '../mocks';
import { JsonRpcResponse } from './types';

test('initialises correctly', () => {
  const port = new MockPort('test-app::westend');
  const manager = new MockConnectionManager(true);
  const am = new AppMediator(port, manager);
  expect(am.name).toBe('test-app::westend');
  expect(am.appName).toBe('test-app');
  expect(am.url).toBe(port.sender.url);
  expect(am.tabId).toBe(port.sender.tab.id);
});

function associateWithNetwork(am: AppMediator, port: MockPort, network: string) {
  port.triggerMessage({ type: 'associate', payload: network });
  expect(am.state).toBe('ready');
  expect(am.smoldotName).toBe(network);

  // TODO: check that an info message is sent back to the UApp on success
}

test('becomes ready after associating with a client and can send messages', () => {
  const port = new MockPort('test-app::westend');
  const manager = new MockConnectionManager(true);
  const am = new AppMediator(port, manager);

  associateWithNetwork(am, port, 'westend');

  port.triggerMessage({ type: 'rpc', payload: '{ "id": 1 }'});
  expect(am.requests.length).toBe(1);
});

test('emits error when manager does not have client for the network', () => {
  const port = new MockPort('test-app::westend');
  const manager = new MockConnectionManager(false);
  new AppMediator(port, manager);
  const network = 'westend';

  port.triggerMessage({ type: 'associate', payload: network });
  expect(port.postMessage).toBeCalledTimes(1);
  expect(port.postMessage).toBeCalledWith({ 
    type: 'error', 
    payload: `Extension does not have client for ${network}`
  });
});

test('emits error when recieves RPC message before associated', () => {
  const port = new MockPort('test-app::westend');
  const manager = new MockConnectionManager(false);
  const am = new AppMediator(port, manager);

  port.triggerMessage({ type: 'rpc', payload: '' });
  expect(port.postMessage).toBeCalledTimes(1);
  expect(port.postMessage).toBeCalledWith({ 
    type: 'error', 
    payload: `The app is not associated with a blockchain client`
  });
});

test('does nothing when it has sent no requests', () => {
  const port = new MockPort('test-app::polkadot');
  const manager = new MockConnectionManager(true);
  const am = new AppMediator(port, manager);

  associateWithNetwork(am, port, 'polkadot');

  const message: JsonRpcResponse = { id: 1, jsonrpc: '2.0', result: {} };

  expect(am.processSmoldotMessage(message)).toBe(false);
});

test('remaps the id to the apps id', () => {
  const port = new MockPort('test-app::kusama');
  const manager = new MockConnectionManager(true);
  const am = new AppMediator(port, manager);

  associateWithNetwork(am, port, 'kusama');

  // Fake getting a request from UApp to send an RPC message
  port.triggerMessage({ 
    type: 'rpc', 
    payload: '{"id":1,"jsonrpc":"2.0","method":"state_getStorage","params":["<hash>"]}' 
  });
  // should have a request mapping
  expect(am.cloneRequests().length).toBe(1);

  // Fake an RPC response to the request
  const message: JsonRpcResponse = { id: manager.lastId, jsonrpc: '2.0', result: {} };
  expect(am.processSmoldotMessage(message)).toBe(true);
  // should have removed request mapping
  expect(am.cloneRequests().length).toBe(0);
  // should have posted the message back to the UApp with the mapped ID
  expect((port.postMessage.mock.calls[0][0] as ExtensionMessage).payload)
    .toEqual('{"id":1,"jsonrpc":"2.0","result":{}}');
});

function setupAppMediatorWithSubscription(am: AppMediator, port: MockPort, appIDForRequest: number, subID: number) {
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
  const msgCalls = port.postMessage.mock.calls;
  const lastMsg = msgCalls[msgCalls.length - 1][0] as ExtensionMessage;
  expect(lastMsg.payload).toEqual(`{"id":${appIDForRequest},"jsonrpc":"2.0","result":${subID}}`);
}

test('tracks and forwards subscriptions', () => {
  const port = new MockPort('test-app::westend');
  const manager = new MockConnectionManager(true);
  const am = new AppMediator(port, manager);

  associateWithNetwork(am, port, 'westend');

  const appIDForRequest = 1
  const subscriptionId = 2;
  setupAppMediatorWithSubscription(am, port, appIDForRequest, subscriptionId);

  // Fake receiving an RPC message for the subscription
  const subMessage = { 
    jsonrpc: '2.0', 
    method: 'system_health',
    params: { subscription: subscriptionId, result: "subscription value" }
  };
  expect(am.processSmoldotMessage(subMessage)).toBe(true);

  // should send subcription message back to the UApp unchanged 
  expect((port.postMessage.mock.calls[1][0] as ExtensionMessage).payload)
    .toEqual(JSON.stringify(subMessage));

  // Fake receiving an RPC message with a subscription ID that is not one of
  // our subscriptions
  const subMessage2 = { 
    jsonrpc: '2.0', 
    method: 'system_health',
    params: { subscription: 666, result: "subscription value" }
  };
  // shouldnt process it
  expect(am.processSmoldotMessage(subMessage2)).toBe(false);
});

test('unsubscribes from all subs on disconnect', () => {
  const port = new MockPort('test-app::westend');
  const manager = new MockConnectionManager(true);
  const am = new AppMediator(port, manager);

  associateWithNetwork(am, port, 'westend');

  setupAppMediatorWithSubscription(am, port, 1, 1);
  setupAppMediatorWithSubscription(am, port, 2, 2);

  port.triggerDisconnect();
  expect(am.state).toBe('disconnecting');
  let pendingRequests = am.cloneRequests();
  expect(pendingRequests.length).toBe(2);

  // First unsub repsonse
  const unsub1 = { jsonrpc:'2.0', id: pendingRequests[0].smoldotID, result: true };
  expect(am.processSmoldotMessage(unsub1)).toBe(true);
  expect(am.state).toBe('disconnecting');
  pendingRequests = am.cloneRequests();
  expect(pendingRequests.length).toBe(1);

  // Second unsub repsonse
  const unsub2 = { jsonrpc:'2.0', id: pendingRequests[0].smoldotID, result: true };
  expect(am.processSmoldotMessage(unsub2)).toBe(true);
  expect(am.state).toBe('disconnected');
  pendingRequests = am.cloneRequests();
  expect(pendingRequests.length).toBe(0);
});
