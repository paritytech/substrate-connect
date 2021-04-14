/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { ExtensionProviderMessage } from '../types';
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
    // Receive from ExtensionProvider the App "subscription"
    window.addEventListener('message', this.#handleMessage);
  }

  #handleMessage = ({ data }: ExtensionProviderMessage): void => {
    if (!data.origin || data.origin !== EXTENSION_PROVIDER_ORIGIN) {
      return;
    }
    debug(`RECEIEVED MESSAGE FROM ${EXTENSION_PROVIDER_ORIGIN}`, data);

    let port: chrome.runtime.Port;

    if (data.message === 'disconnect') {
      port = this.#ports[data.chainName];
      port.disconnect();
      debug(`DISCONNECTED ${data.chainName} PORT`, port);
      delete this.#ports[data.chainName];
      return;
    }

    if (data.message.type === 'associate') {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      port = chrome.runtime.connect({ name: `${data.appName}::${data.chainName}` });
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
      // TODO(rem): do we actually need to send the origin to the background
      // can we not just forward the message?
      port.postMessage({ ...data.message, origin: EXTENSION_PROVIDER_ORIGIN});
      return;
    }

    port = this.#ports[data.chainName];
    if (!port) {
      // this is probably someone trying to abuse the extension.
      console.warn(`App requested to send message to ${data.chainName} - no port found`);
      return;
    }

    debug(`SENDING MESSAGE TO ${data.chainName} PORT`, data.message);
    port.postMessage({ ...data.message, origin: EXTENSION_PROVIDER_ORIGIN});
  }

}

