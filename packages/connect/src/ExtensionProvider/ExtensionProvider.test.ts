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
    action: 'forward',
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

test('disconnect sends disconnect message and emits disconnected', async () => {
  const ep = new ExtensionProvider('test', 'test-chain');
  const emitted = jest.fn();
  await ep.connect();

  ep.on('disconnected', emitted);
  await ep.disconnect();

  const expectedMessage = {
    appName: 'test',
    chainName: 'test-chain',
    action: 'disconnect',
    origin: 'extension-provider'
  };
  expect(window.postMessage).toHaveBeenCalledTimes(2);
  expect(window.postMessage).toHaveBeenNthCalledWith(2, expectedMessage, '*');
  expect(ep.isConnected).toBe(false);
  expect(emitted).toHaveBeenCalledTimes(1);
});
