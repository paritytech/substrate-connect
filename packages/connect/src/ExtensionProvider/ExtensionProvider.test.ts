import {jest} from '@jest/globals'
import { ExtensionProvider } from './ExtensionProvider';

describe('ExtensionProvider', () => {

  beforeEach(() => {
    window.postMessage = jest.fn();
  });

  it('constructor sets properties', async () => {
    const ep = new ExtensionProvider('test', 'kusama');
    expect(ep.name).toBe('test');
    expect(ep.chainName).toBe('kusama');
  });

  it('connect sends init message and emits connected', async () => {
    const ep = new ExtensionProvider('test', 'kusama');
    const emitted = jest.fn();
    ep.on('connected', emitted);
    await ep.connect();


    const expectedMessage = {
      appName: 'test',
      message: '{"type":"associate","payload":"kusama"}',
      origin: 'extension-provider'
    };
    expect(window.postMessage).toHaveBeenCalledTimes(1);
    expect(window.postMessage).toHaveBeenCalledWith(expectedMessage, '*');
    expect(ep.isConnected).toBe(true);
    expect(emitted).toHaveBeenCalledTimes(1);
  });

});
