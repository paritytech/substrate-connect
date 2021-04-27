import { jest } from '@jest/globals';
import { ConnectionManager } from './ConnectionManager';
import westend from '../../public/assets/westend.json';
import kusama from '../../public/assets/kusama.json';
import { MockPort } from '../mocks';

const  connectApp = (manager: ConnectionManager, tabId: number, name: string, network: string): MockPort => {
  const port = new MockPort(`${name}::${network}`);
  port.setTabId(tabId);
  manager.addApp(port);
  port.triggerMessage({ type: 'associate', payload: network });
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
  const port1 = connectApp(manager, 42, 'test-app', 'westend');
  expect(handler).toHaveBeenCalledTimes(2);
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
  const port2 = connectApp(manager, 42, 'test-app', 'kusama');
  expect(handler).toHaveBeenCalledTimes(2);
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
  const port3 = connectApp(manager, 43, 'another-app', 'kusama');
  expect(handler).toHaveBeenCalledTimes(2);
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
  port3.triggerDisconnect();
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
  manager.shutdown();
});
