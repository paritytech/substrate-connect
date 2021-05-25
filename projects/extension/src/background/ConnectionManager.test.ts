/* eslint-disable @typescript-eslint/unbound-method */
import { jest } from '@jest/globals';
import { ConnectionManager } from './ConnectionManager';
import westend from '../../public/assets/westend.json';
import kusama from '../../public/assets/kusama.json';
import { MockPort } from '../mocks';

const  connectApp = (manager: ConnectionManager, tabId: number, name: string, network: string): MockPort => {
  const port = new MockPort(`${name}::${network}`);
  port.setTabId(tabId);
  manager.addApp(port);
  return port;
}

describe('Connection Manager unit test', () => {
  const manager = new ConnectionManager();
  const handler = jest.fn();

  beforeAll(async () => {
    manager.smoldotLogLevel = 1;
    //setup connection manager with 2 networks
    await manager.addSmoldot('westend', JSON.stringify(westend));
    await manager.addSmoldot('kusama', JSON.stringify(kusama));
    manager.on('stateChanged', handler);

    //add 4 apps in clients
    connectApp(manager, 1, 'test-app-1', 'westend');
    connectApp(manager, 2, 'test-app-2', 'kusama');
    connectApp(manager, 3, 'test-app-3', 'westend');
    connectApp(manager, 4, 'test-app-4', 'kusama');
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

  test('Get networks', () => {
    expect(manager.networks).toEqual([
      { name: 'westend', status: "connected", chainspecPath: "westend.json", isKnown: true },
      { name: 'kusama', status: "connected", chainspecPath: "kusama.json", isKnown: true }
    ]);
  });

  test('Get current state', () => {
    expect(manager.getState()).toEqual({
      apps: [
        { name: 'test-app-1', tabId: 1, networks: [{ name: 'westend' }] },
        { name: 'test-app-2', tabId: 2, networks: [{ name: 'kusama' }] },
        { name: 'test-app-3', tabId: 3, networks: [{ name: 'westend' }] },
        { name: 'test-app-4', tabId: 4, networks: [{ name: 'kusama' }] }
      ]
    });
  });

  test('Has client for', () => {
    expect(manager.hasClientFor('kusama')).toBe(true);
    expect(manager.hasClientFor('polkadot')).toBe(false);
  });
});

describe('Multiple tests - adding and removing apps changes state', () => {
  const manager = new ConnectionManager();
  const handler = jest.fn();
  let port: MockPort;

  beforeAll(async () => {
    manager.smoldotLogLevel = 1;
    //setup connection manager with 2 networks
    await manager.addSmoldot('westend', JSON.stringify(westend));
    await manager.addSmoldot('kusama', JSON.stringify(kusama));
    manager.on('stateChanged', handler);  
  });

  afterAll(() => {
    manager.shutdown();
  });

  beforeEach(() => {
    handler.mockClear();
  });
  
  test('App connects to first network', () => {
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
  });

  test('App connects to second network', () => {
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
  });

  test('Different app connects to second network', () => {
    port = connectApp(manager, 43, 'another-app', 'kusama');
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
  });

  test('Disconnect second app', () => {
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
  });

  test('Disconnect fist app through manager', () => {
    manager.disconnectTab(42);
    expect(handler).toHaveBeenCalledTimes(2);
    expect(manager.getState()).toEqual({ apps: [ ] });
  });
});
