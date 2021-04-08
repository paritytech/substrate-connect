import {jest} from '@jest/globals'
import { ExtensionProvider } from './ExtensionProvider';

beforeEach(() => {
  window.postMessage = jest.fn();
});

test('constructor sets properties', async () => {
  const ep = new ExtensionProvider('test', 'kusama');
  expect(ep.name).toBe('test');
  expect(ep.chainName).toBe('kusama');
});

test('connect sends init message and emits connected', async () => {
  const ep = new ExtensionProvider('test', 'test-chain');
  const emitted = jest.fn();
  ep.on('connected', emitted);
  await ep.connect();


  const expectedMessage = {
    appName: 'test',
    chainName: 'test-chain',
    message: {
      type: 'associate',
      payload: 'test-chain'
    },
    origin: 'extension-provider'
  };
  expect(window.postMessage).toHaveBeenCalledTimes(1);
  expect(window.postMessage).toHaveBeenCalledWith(expectedMessage, '*');
  expect(ep.isConnected).toBe(true);
  expect(emitted).toHaveBeenCalledTimes(1);
});
