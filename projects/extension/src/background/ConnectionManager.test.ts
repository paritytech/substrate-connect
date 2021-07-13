import { jest } from '@jest/globals';
import { ConnectionManager } from './ConnectionManager';
import westend from '../../public/assets/westend.json';
import kusama from '../../public/assets/kusama.json';
import { MockPort } from '../mocks';
import { JsonRpcRequest } from './types';
import { AppMediator } from './AppMediator';

const  connectApp = (manager: ConnectionManager, tabId: number, name: string, network: string): MockPort => {
  const port = new MockPort(`${name}::${network}`);
  port.setTabId(tabId);
  manager.addApp(port);
  return port;
}

test('adding and removing apps changes state', async () => {
  //setup conenection manager with 2 chains
  const manager = new ConnectionManager();
  manager.smoldotLogLevel = 1;
  await manager.initSmoldot();
  await manager.addChain('westend', JSON.stringify(westend));
  await manager.addChain('kusama', JSON.stringify(kusama));

  const handler = jest.fn();
  manager.on('stateChanged', handler);

  // app connects to first network
  connectApp(manager, 42, 'test-app', 'westend');
  expect(handler).toHaveBeenCalledTimes(1);
  expect(manager.getState()).toEqual({
    apps: [
      { 
        name: 'test-app',
        tabId: 42,
        networks: [ { name: 'westend' } ]
      }
    ]
  });

  // app connects to second network
  handler.mockClear();
  connectApp(manager, 42, 'test-app', 'kusama');
  expect(handler).toHaveBeenCalledTimes(1);
  expect(manager.getState()).toEqual({
    apps: [
      { 
        name: 'test-app',
        tabId: 42,
        networks: [ { name: 'westend' }, { name: 'kusama' } ]
      }
    ]
  });

  // different app connects to second network
  handler.mockClear();
  const port = connectApp(manager, 43, 'another-app', 'kusama');
  expect(handler).toHaveBeenCalledTimes(1);
  expect(manager.getState()).toEqual({
    apps: [
      { 
        name: 'test-app',
        tabId: 42,
        networks: [ { name: 'westend' }, { name: 'kusama' } ]
      },
      { 
        name: 'another-app',
        tabId: 43,
        networks: [ { name: 'kusama' } ]
      }
    ]
  });

  // disconnect second app
  handler.mockClear();
  port.triggerDisconnect();
  expect(handler).toHaveBeenCalled();
  expect(manager.getState()).toEqual({
    apps: [
      { 
        name: 'test-app',
        tabId: 42,
        networks: [ { name: 'westend' }, { name: 'kusama' } ]
      }
    ]
  });


  handler.mockClear();
  manager.disconnectTab(42);
  expect(handler).toHaveBeenCalledTimes(2);
  expect(manager.getState()).toEqual({ apps: [ ] });

  // Connect 2 apps on the same network and 2nd one on another network
  // in order to test disconnectAll functionality
  handler.mockClear();
  // first app connects to network
  connectApp(manager, 1, 'test-app-1', 'westend');
  expect(handler).toHaveBeenCalledTimes(1);
  expect(manager.getState()).toEqual({
    apps: [
      { 
        name: 'test-app-1',
        tabId: 1,
        networks: [ { name: 'westend' } ]
      }
    ]
  });

  // second app connects to same network
  handler.mockClear();
  connectApp(manager, 2, 'test-app-2', 'westend');
  connectApp(manager, 2, 'test-app-2', 'kusama');
  expect(handler).toHaveBeenCalledTimes(2);
  expect(manager.getState()).toEqual({
    apps: [
      { 
        name: 'test-app-1',
        tabId: 1,
        networks: [ { name: 'westend' } ]
      },
      { 
        name: 'test-app-2',
        tabId: 2,
        networks: [ { name: 'westend' }, { name: 'kusama' }  ]
      }
    ]
  });
  handler.mockClear();
  // disconnect all apps;
  manager.disconnectAll();
  expect(handler).toHaveBeenCalledTimes(3);
  expect(manager.getState()).toEqual({ apps: [] });
  manager.shutdown();
});

describe('Unit tests', () => {
  const manager = new ConnectionManager();
  const handler = jest.fn();

  beforeAll(async () => {
    manager.smoldotLogLevel = 1;
    //setup connection manager with 2 networks
    await manager.initSmoldot();
    await manager.addChain('westend', JSON.stringify(westend));
    await manager.addChain('kusama', JSON.stringify(kusama));
    manager.on('stateChanged', handler);

    //add 4 apps in clients
    connectApp(manager, 11, 'test-app-1', 'westend');
    connectApp(manager, 12, 'test-app-2', 'kusama');
    connectApp(manager, 13, 'test-app-3', 'westend');
    connectApp(manager, 14, 'test-app-4', 'kusama');
  });

  afterAll(() => {
    manager.shutdown();
  });

  test('Get registered apps', () => {
    expect(manager.registeredApps).toEqual([
      "test-app-1::westend",
      "test-app-2::kusama",
      "test-app-3::westend",
      "test-app-4::kusama"
    ]);
  });

  test('Get registered clients', () => {
    expect(manager.registeredClients).toEqual([
      "westend",
      "kusama"
    ]);
  });

  test('Get apps', () => {
    expect(manager.apps).toHaveLength(4);
  });

  test('Get networks', () => {
    expect(manager.networks).toEqual([
      { name: 'westend', status: "connected", chainspecPath: "westend.json", isKnown: true },
      { name: 'kusama', status: "connected", chainspecPath: "kusama.json", isKnown: true }
    ]);
  });

  test('Get chains', () => {
    const tmpChains: unknown[] = [];
    manager.chains.forEach(ch => {
      tmpChains.push({
        idx: ch.idx,
        name: ch.name
      })
    })
    expect(tmpChains).toEqual([{ idx: 1, name: 'westend' },{ idx: 2, name: 'kusama' }]);
    expect(manager.chains).toHaveLength(2);
  });

  test('Add an app that already exists', () => {
    const port = connectApp(manager, 13, 'test-app-3', 'westend');
    expect(port.postMessage).toHaveBeenCalledTimes(1);
    expect(port.postMessage).toHaveBeenLastCalledWith({ type: 'info', payload: 'App test-app-3::westend already exists.' })
  });

  test('Test sendRpcMessage', () => {
    const rpcRequest: JsonRpcRequest = { id: 13, jsonrpc: '2.0', method: 'something', params: [] };
    // Westend's #id is 0 at this point - response should be 1
    const responseId = manager.sendRpcMessageTo('westend', rpcRequest)
    expect(responseId).toBe(1);
    expect(() => {
      manager.sendRpcMessageTo('someSmoldot', rpcRequest);
    }).toThrowError('Chain someSmoldot does not exist.');
  });
});

describe('Test functions when smoldot client is terminated', () => {
  const manager = new ConnectionManager();

  beforeEach(async () => {
    manager.smoldotLogLevel = 1;
    await manager.initSmoldot();
  });

  test('Test manager.addApp error', () => {
    const port = new MockPort('test-app-5::westend');
    port.setTabId(15);
    expect(() => {
      manager.shutdown();
      manager.addApp(port);
    }).toThrowError('Smoldot client does not exist.');
  });

  test('Test registerApp error', () => {
    const port = connectApp(manager, 15, 'test-app-5', 'westend');
    const appMed = new AppMediator(port, manager);
    expect(() => {
      manager.shutdown();
      manager.registerApp(appMed);
    }).toThrowError('Tried to register an app to smoldot client that does not exist.');
  });

  test('Test unregisterApp error', () => {
    const port = connectApp(manager, 15, 'test-app-5', 'westend');
    const appMed = new AppMediator(port, manager);
    expect(() => {
      manager.shutdown();
      manager.unregisterApp(appMed);
    }).toThrowError('Tried to unregister an app to smoldot client that does not exist.');
  });
});