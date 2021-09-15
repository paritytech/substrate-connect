/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { jest } from '@jest/globals';
import { ConnectionManager } from './ConnectionManager';
import westend from '../../public/assets/westend.json';
import kusama from '../../public/assets/kusama.json';
import { MockPort } from '../mocks';
import { chrome } from 'jest-chrome';
import { App } from './types';

let port: MockPort;
let manager: ConnectionManager;

const waitForMessageToBePosted = (): Promise<null> => {
  // window.postMessge is async so we must do a short setTimeout to yield to
  // the event loop
  return new Promise(resolve => setTimeout(resolve, 10, null));
}

const connectApp = (manager: ConnectionManager, tabId: number, name: string, network: string): MockPort => {
  const port = new MockPort(`${name}::${network}`);
  port.setTabId(tabId);
  manager.addApp(port);
  return port;
};

const doNothing = () => {
  // Do nothing
};

test('adding and removing apps changes state', async () => {
  //setup connection manager with 2 chains
  const manager = new ConnectionManager();
  manager.smoldotLogLevel = 1;
  await manager.initSmoldot();
  await manager.addChain(JSON.stringify(westend), doNothing);
  await manager.addChain(JSON.stringify(kusama), doNothing);

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
    await manager.addChain(JSON.stringify(westend), doNothing);
    await manager.addChain(JSON.stringify(kusama), doNothing);
    manager.on('stateChanged', handler);

    //add 4 apps in clients
    connectApp(manager, 11, 'test-app-1', 'Westend');
    connectApp(manager, 12, 'test-app-2', 'Kusama');
    connectApp(manager, 13, 'test-app-3', 'Westend');
    connectApp(manager, 14, 'test-app-4', 'Kusama');
  });

  afterAll(() => {
    manager.shutdown();
  });

  test('Get registered apps', () => {
    expect(manager.registeredApps).toEqual([
      "test-app-1::Westend",
      "test-app-2::Kusama",
      "test-app-3::Westend",
      "test-app-4::Kusama"
    ]);
  });

  test('Get registered clients', () => {
    expect(manager.registeredClients).toEqual([
      "Westend",
      "Kusama"
    ]);
  });

  test('Get apps', () => {
    expect(manager.apps).toHaveLength(4);
  });

  test('Get networks/chains', () => {
    // With this look the "chain" is removed intentionally as "chain"
    // object cannot be compared with jest 
    const tmpChains = manager.networks.map(n => (
      {
        name: n.name,
        status: n.status
      })
    )

    expect(tmpChains).toEqual([
      { name: 'Westend', status: "connected" },
      { name: 'Kusama', status: "connected" }
    ]);

    expect(manager.networks).toHaveLength(2);
  });

  test('Adding an app that already exists sends an error and disconnects', () => {
    const port = connectApp(manager, 13, 'test-app-3', 'Westend');
    expect(port.postMessage).toHaveBeenCalledTimes(1);
    expect(port.postMessage).toHaveBeenLastCalledWith({ type: 'error', payload: 'App test-app-3::Westend already exists.' })
    expect(port.disconnect).toHaveBeenCalled();
  });
});

describe('When the manager is shutdown', () => {
  const manager = new ConnectionManager();

  beforeEach(async () => {
    manager.smoldotLogLevel = 1;
    await manager.initSmoldot();
  });

  test('adding an app after the manager is shutdown throws an error', () => {
    const port = new MockPort('test-app-5::westend');
    port.setTabId(15);
    expect(() => {
      manager.shutdown();
      manager.addApp(port);
    }).toThrowError('Smoldot client does not exist.');
  });
});

describe('Check storage and send notification when adding an app', () => {
  const manager = new ConnectionManager();

  chrome.storage.sync.get.mockImplementation((keys, callback) => {
    callback({ notifications: true }) 
  });

  beforeEach(async () => {
    chrome.storage.sync.get.mockClear();
    chrome.notifications.create.mockClear();
    manager.smoldotLogLevel = 1;
    await manager.initSmoldot();
  });

  afterEach( () => {
    manager.shutdown();
  })

  test('Checks storage for notifications preferences', () => {
    const port = new MockPort('test-app-6::westend');
    manager.addApp(port);
    expect(chrome.storage.sync.get).toHaveBeenCalledTimes(1);
  });

  test('Sends a notification', () => {
    const port = new MockPort('test-app-7::westend');
    manager.addApp(port);

    const notificationData = {
      message: "App test-app-7 connected to westend.",
      title: "Substrate Connect",
      iconUrl: "./icons/icon-32.png",
      type: "basic"
    }

    expect(chrome.notifications.create).toHaveBeenCalledTimes(1);
    expect(chrome.notifications.create).toHaveBeenCalledWith('test-app-7::westend', notificationData);
  });
});

describe('Apps specific tests with actual ConnectionManager', () => {
  let app: App
  beforeEach(() => {
    port = new MockPort('test-app::westend');
    manager = new ConnectionManager();
    app = manager.createApp(port);
  });

  test('Construction parses the port name and gets port information', () => {
    expect(app.name).toBe('test-app::westend');
    expect(app.appName).toBe('test-app');
    expect(app.url).toBe(port.sender.url);
    expect(app.tabId).toBe(port.sender.tab.id);
  });

  test('Connected state', () => {
    app = manager.createApp(port);
    port.triggerMessage({ type: 'spec', payload: 'westend'});
    port.triggerMessage({ type: 'rpc', payload: '{ "id": 1 }'});
    expect(app.state).toBe('connected');
  });

  test('Disconnect cleans up properly', async () => {
    app = manager.createApp(port);
    port.triggerMessage({ type: 'spec', payload: 'westend'});
    await waitForMessageToBePosted();
    manager.disconnect(app);
    await waitForMessageToBePosted();
    expect(app.state).toBe('disconnected');
  });

  test('Invalid port name sends an error and disconnects', () => {
    port = new MockPort('invalid');
    const errorMsg = { 
      type: 'error', 
      payload: 'Invalid port name invalid expected <app_name>::<chain_name>'
    };
    expect(() => {
      manager.createApp(port)
    }).toThrow(errorMsg.payload);
    expect(port.postMessage).toHaveBeenCalledWith(errorMsg);
    expect(port.disconnect).toHaveBeenCalled();
  });

  test('Connected state', () => {
    port.triggerMessage({ type: 'spec', payload: 'westend'});
    port.triggerMessage({ type: 'rpc', payload: '{ "id": 1 }'});
    expect(app.state).toBe('connected');
  });

  test('Smoldot throws error when it does not exist', async () => {
    try {
      await manager.addChain(JSON.stringify(kusama), doNothing);
    } catch (err: any) {
      expect(err.message).toBe('Smoldot client does not exist.')
    }
  });

  test('Spec message adds a chain', async () => {
    port.triggerMessage({ type: 'spec', payload: 'westend'});
    await waitForMessageToBePosted();
    expect(app.healthChecker).toBeDefined();
  });

  test('Buffers RPC messages before spec message', async () => {
    const message1 = JSON.stringify({ id: 1, jsonrpc: '2.0', result: {} });
    port.triggerMessage({ type: 'rpc', payload: message1 });
    const message2 = JSON.stringify({ id: 2, jsonrpc: '2.0', result: {} });
    port.triggerMessage({ type: 'rpc', payload: message2 });
    port.triggerMessage({ type: 'spec', payload: 'westend'});
    await waitForMessageToBePosted();
    expect(app.healthChecker).toBeDefined();
  });

  test('RPC port message sends the message to the chain', async () => {
    port.triggerMessage({ type: 'spec', payload: 'westend'});
    await waitForMessageToBePosted();
    const message = JSON.stringify({ id: 1, jsonrpc: '2.0', result: {} });
    port.triggerMessage({ type: 'rpc', payload: message});
    await waitForMessageToBePosted();
  });

  test('App already disconnected', async () => {
    app = manager.createApp(port);
    port.triggerMessage({ type: 'spec', payload: 'westend'});
    await waitForMessageToBePosted();
    manager.disconnect(app);
    await waitForMessageToBePosted();
    expect(() => {
      manager.disconnect(app)
    }).toThrowError('Cannot disconnect - already disconnected');
  });
});