/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { ExtensionProviderMessage, AppMessage } from '../types';
import { debug } from '../utils/debug';

const CONTENT_SCRIPT_ORIGIN = 'content-script';
const EXTENSION_PROVIDER_ORIGIN ='extension-provider';

/* ExtensionMessageRouter is the part of the content script that listens for
 * messages that the ExtensionProvider in an app sends using `window.postMessage`.
 * It establishes connections to the extension background on behalf of the app,
 * forwards RPC requests for the app to the extension background and disconnects
 * the port when the app requests it.
 *
 * Conversely it listens for messages sent through the port from the extension
 * background and forwards them to the app via `window.postMessage`
 *
 * This router exists because the app does not have access to the chrome APIs
 * to establish the connection with the background itself.
 */
export class ExtensionMessageRouter {
  #ports: Record<string, chrome.runtime.Port> = {};

  get connections(): string[] {
    return Object.keys(this.#ports);
  }

  listen(): void {
    window.addEventListener('message', this.#handleMessage);
  }

  stop(): void {
    window.removeEventListener('message', this.#handleMessage);

  }

  #establishNewConnection = (message: ExtensionProviderMessage): void => {
     const data = message.data;
    const port = chrome.runtime.connect({ name: `${data.appName}::${data.chainName}` });
    debug(`CONNECTED ${data.chainName} PORT`, port);
    // forward any messages: extension -> page
    const chainName = data.chainName;
    port.onMessage.addListener((data): void => {
      debug(`RECIEVED MESSGE FROM ${chainName} PORT`, data);
      window.postMessage({
        message: data.payload,
        origin: CONTENT_SCRIPT_ORIGIN
      }, '*');
    });

    this.#ports[data.chainName] = port;
    debug(`SENDING ASSOCIATE MESSAGE TO ${data.chainName} PORT`, data.message);
    port.postMessage(data.message);
  }

  #forwardRpcMessage = (message: ExtensionProviderMessage): void => {
    const data = message.data;
    const port = this.#ports[data.chainName];
    if (!port) {
      // this is probably someone trying to abuse the extension.
      console.warn(`App requested to send message to ${data.chainName} - no port found`);
      return;
    }

    debug(`SENDING RPC MESSAGE TO ${data.chainName} PORT`, data.message);
    port.postMessage(data.message);
  }

  #disconnectPort = (message: ExtensionProviderMessage): void => {
    const data = message.data;
    const port = this.#ports[data.chainName];

    if (!port) {
      // probably someone trying to abuse the extension.
      console.warn(`App requested to disconnect ${data.chainName} - no port found`);
      return;
    }

    port.disconnect();
    debug(`DISCONNECTED ${data.chainName} PORT`, port);
    delete this.#ports[data.chainName];
    return;
  }

  #handleMessage = (message: ExtensionProviderMessage): void => {
    const data = message.data;
    if (!data.origin || data.origin !== EXTENSION_PROVIDER_ORIGIN) {
      return;
    }

    debug(`RECEIEVED MESSAGE FROM ${EXTENSION_PROVIDER_ORIGIN}`, data);

    if (!data.action) {
      return console.warn('Malformed message - missing action', message);
    }

    if (data.action === 'disconnect') {
      return this.#disconnectPort(message);
    }

    if (data.action === 'forward') {
      const innerMessage = data.message as AppMessage;
      if (!innerMessage.type) {
        // probably someone abusing the extension
        console.warn('Malformed message - missing message.type', data);
        return;
      }

      if (innerMessage.type === 'associate') {
        return this.#establishNewConnection(message);
      }

      if (innerMessage.type === 'rpc') {
        return this.#forwardRpcMessage(message);
      }

      // probably someone abusing the extension
      return console.warn('Malformed message - unrecognised message.type', data);
    }

    // probably someone abusing the extension
    return console.warn('Malformed message - unrecognised action', data);
  }
}

