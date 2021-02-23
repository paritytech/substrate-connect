import { AppMediator } from './AppMediator';
import { MockPort, MockConnectionManager } from './mocks';

describe('AppMediator setup', () => {

  it('initialises correctly', () => {
    const port = new MockPort('test');
    const manager = new MockConnectionManager(true);
    const am = new AppMediator('test', port, manager);
    expect(am.name).toBe('test');
    expect(am.url).toBe(port.sender.url);
    expect(am.tabId).toBe(port.sender.tab.id);
  });

});

describe('AppMediator - protocol with content script', () => {

  it('becomes ready after associating with a client and can send messages', () => {
    const port = new MockPort('test');
    const manager = new MockConnectionManager(true);
    const am = new AppMediator('test', port, manager);

    port.triggerMessage({ type: 'associate', payload: 'westend' });
    expect(am.state).toBe('ready');

    port.triggerMessage({ type: 'rpc', payload: '{ "id": 1 }'});
    expect(am.requests.length).toBe(1);
  });

  it('emits error when manager does not have client for the network', () => {
    const port = new MockPort('test');
    const manager = new MockConnectionManager(false);
    new AppMediator('test', port, manager);
    const network = 'westend';

    port.triggerMessage({ type: 'associate', payload: network });
    expect(port.postMessage).toBeCalledTimes(1);
    expect(port.postMessage).toBeCalledWith({ 
      type: 'error', 
      payload: `Extension does not have client for ${network}`
    });
  });

  it('emits error when recieves RPC message before associated', () => {
    const port = new MockPort('test');
    const manager = new MockConnectionManager(false);
    const am = new AppMediator('test', port, manager);
    const network = 'westend';

    port.triggerMessage({ type: 'rpc', payload: '' });
    expect(port.postMessage).toBeCalledTimes(1);
    expect(port.postMessage).toBeCalledWith({ 
      type: 'error', 
      payload: `The app is not associated with a blockchain client`
    });


    // TODO - test receiving RPC message when state is 'disconnecting' | 'disconnected'
  });

  // We exercise all the message handling through the client manager to avoid
  // coupling all our tests to the implementation details

});

