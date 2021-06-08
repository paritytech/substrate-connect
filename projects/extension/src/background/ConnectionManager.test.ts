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

test('adding and removing apps changes state', async () => {
  //setup conenection manager with 2 networks
  const manager = new ConnectionManager();
  manager.smoldotLogLevel = 1;
  await manager.addSmoldot('westend', JSON.stringify(westend));
  await manager.addSmoldot('kusama', JSON.stringify(kusama));

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
