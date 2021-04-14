import { jest } from '@jest/globals';
import { ConnectionManager } from './ConnectionManager';
import westend from '../assets/westend.json';
import kusama from '../assets/kusama.json';
import { MockPort } from './mocks';

test('adding and removing apps changes state', async () => {
  //setup conenection manager with 2 networks
  const manager = new ConnectionManager();
  manager.smoldotLogLevel = 1;
  await manager.addSmoldot('westend', JSON.stringify(westend));
  await manager.addSmoldot('kusama', JSON.stringify(kusama));

  const handler = jest.fn();
  manager.on('stateChanged', handler);

  // app connects to first network
  const port = new MockPort('test-app::westend');
  port.setTabId(42);
  manager.addApp(port);
  port.triggerMessage({ type: 'associate', payload: 'westend' });

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
  const port2 = new MockPort('test-app::kusama');
  port2.setTabId(42);
  manager.addApp(port2);
  port2.triggerMessage({ type: 'associate', payload: 'kusama' });

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
  const port3 = new MockPort('another-app::kusama');
  port3.setTabId(43);
  manager.addApp(port3);
  port3.triggerMessage({ type: 'associate', payload: 'kusama' });

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

  manager.shutdown();
});
