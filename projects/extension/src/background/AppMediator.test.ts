import { AppMediator } from './AppMediator';
import { MockPort, MockConnectionManager } from './mocks';
import { JsonRpcResponse, JsonRpcResponseSubscription } from './types';

describe('AppMediator setup', () => {

  it('initialises correctly', () => {
    const port = new MockPort('test');
    const manager = new MockConnectionManager(true);
    const am = new AppMediator('test', port, 'westend', manager);
    expect(am.name).toBe('test');
    expect(am.url).toBe(port.sender.url);
    expect(am.tabId).toBe(port.sender.tab.id);
  });

});

describe('AppMediator - protocol with content script', () => {

  it('becomes ready after associating with a client and can send messages', () => {
    const port = new MockPort('test');
    const manager = new MockConnectionManager(true);
    const am = new AppMediator('test', port, 'westend', manager);

    port.triggerMessage({ type: 'associate', payload: 'westend' });
    expect(am.state).toBe('ready');

    port.triggerMessage({ type: 'rpc', payload: '{ "id": 1 }'});
    expect(am.requests.length).toBe(1);
  });

  it('emits error when manager does not have client for the network', () => {
    const port = new MockPort('test');
    const manager = new MockConnectionManager(false);
    new AppMediator('test', port, 'westend', manager);
    const network = 'westend';

    port.triggerMessage({ type: 'associate', payload: network });
    expect(port.postMessage).toBeCalledTimes(2);
    expect(port.postMessage).toBeCalledWith({ 
      type: 'error', 
      payload: `Extension does not have client for ${network}`
    });
  });

  it('emits error when recieves RPC message before associated', () => {
    const port = new MockPort('test');
    const manager = new MockConnectionManager(false);
    const am = new AppMediator('test', port, 'westend', manager);
    const network = 'westend';

    port.triggerMessage({ type: 'rpc', payload: '' });
    expect(port.postMessage).toBeCalledTimes(2);
    expect(port.postMessage).toBeCalledWith({ 
      type: 'error', 
      payload: `The app is not associated with a blockchain client`
    });


    // TODO - test receiving RPC message when state is 'disconnecting' | 'disconnected'
  });

});

describe('AppMediator regular message processing', () => {

  it('does nothing when it has sent no requests', () => {
    const port = new MockPort('test');
    const manager = new MockConnectionManager(false);
    const am = new AppMediator('test', port, 'westend', manager);
    // asociate
    const network = 'westend';
    port.triggerMessage({ type: 'associate', payload: network });

    const message: JsonRpcResponse = { id: 1, jsonrpc: '2.0', result: {} };

    expect(am.processSmoldotMessage(message)).toBe(false);
  });

  it('remaps the id to the apps id', () => {
    const port = new MockPort('test');
    const manager = new MockConnectionManager(true);
    const am = new AppMediator('test', port, 'westend', manager);
    // asociate
    const network = 'westend';
    port.triggerMessage({ type: 'associate', payload: network });

    // send RPC request
    port.triggerMessage({ 
      type: 'rpc', 
      payload: '{ "id": 1, "jsonrpc": "2.0", "method": "system_health", "params": [] }' 
    });
    // RPC response
    const message: JsonRpcResponse = { id: 42, jsonrpc: '2.0', result: {} };
    // should have a request mapping
    expect(am.cloneRequests().length).toBe(1);

    expect(am.processSmoldotMessage(message)).toBe(true);
    // should have removed request mapping
    expect(am.cloneRequests().length).toBe(0);
    // expect(port.postMessage.mock.calls[0][0].payload)
    //   .toEqual('{"id":1,"jsonrpc":"2.0","result":{}}');
  });
});

describe('Appmediator subscription message processing', () => {
  
  it('tracks and forwards subscriptions', () => {
    const port = new MockPort('test');
    const manager = new MockConnectionManager(true);
    const am = new AppMediator('test', port, 'westend', manager);
    // asociate
    const network = 'westend';
    port.triggerMessage({ type: 'associate', payload: network });

    // send RPC sub request
    port.triggerMessage({ 
      type: 'rpc', 
      payload: '{ "id": 1, "jsonrpc": "2.0", "method": "system_health", "params": [] }' ,
      subscription: true
    });
    // should have a request mapping and a subscription mapping
    expect(am.cloneRequests().length).toBe(1);
    expect(am.cloneSubscriptions().length).toBe(1);
    // has sub with no subID
    expect(am.cloneSubscriptions()[0]).toEqual({ appIDForRequest: 1, subID: undefined, method: 'system_health' });

    // RPC response with sub id
    const message: JsonRpcResponse = { id: 42, jsonrpc: '2.0', result: 2 };
    am.processSmoldotMessage(message);

    // updates sub with sub id
    expect(am.cloneSubscriptions()[0]).toEqual({ appIDForRequest: 1, subID: 2, method: 'system_health' });

    // should send sub response back to app
    // expect(port.postMessage.mock.calls[0][0].payload)
    //   .toEqual('{"id":1,"jsonrpc":"2.0","result":2}');

    // RPC subcription message
    const subMessage = { 
      jsonrpc: '2.0', 
      method: 'system_health',
      params: { subscription: 2, result: 2 }
    };
    expect(am.processSmoldotMessage(subMessage)).toBe(true);

    // should send subcription message back to app
    // expect(port.postMessage.mock.calls[1][0].payload)
    //   .toEqual('{"jsonrpc":"2.0","method":"system_health","params":{"subscription":2,"result":2}}');

    // RPC subcription message not for us
    const subMessage2 = { 
      jsonrpc: '2.0', 
      method: 'system_health',
      params: { subscription: 666, result: 2 }
    };
    // shouldnt process it
    expect(am.processSmoldotMessage(subMessage2)).toBe(false);
  });

});
