import { jest } from '@jest/globals';
import { ConnectionManager } from './ConnectionManager';
import { MockPort } from './mocks';

test('emits stateChanged for new connection', () => {
  const manager = new ConnectionManager();
  const port = new MockPort('test-app::westend');
  const handler = jest.fn();
  manager.on('stateChanged', handler);
  manager.addApp(port);
  expect(handler).toHaveBeenCalled();
});
