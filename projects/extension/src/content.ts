/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { Message } from './types';
const SMOLDOT_CONTENT = 'smoldot';
const EXTENSION_ORIGIN = 'extension-provider';

const ports: Record<string, chrome.runtime.Port> = {};

export type AppMessageType = 'associate' | 'rpc';
export interface AppMessage {
  type: AppMessageType;
  payload: string; // name of the network or an rpc string (json stringified RPC message)
}

// Receive from ExtensionProvider the App "subscription"
window.addEventListener('message', ({ data }: Message): void => {
  if (!data.origin || data.origin !== EXTENSION_ORIGIN) {
    // message didnt come from the extension provider
    return;
  }

  let appData: AppMessage;
  let port: chrome.runtime.Port;

  const conv = data?.message as unknown as AppMessage;
  if (conv?.type === 'associate') {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    port = chrome.runtime.connect({ name: `${data.appName}::${data.chainName}` });
    // send any messages: extension -> page
    port.onMessage.addListener((data): void => {
      window.postMessage({ message: data?.payload, origin: SMOLDOT_CONTENT }, '*');
    });

    const chainName: string = JSON.parse(conv?.payload).chainName;
    ports.chainName = port;
    appData = {
      type: conv?.type,
      payload: chainName
    }
  } else {
    port = ports[data.chainName as string];
    appData = JSON.parse(data?.message || '');
  }

  port.postMessage({ ...appData, origin: EXTENSION_ORIGIN});
});


// inject page.ts to the tab
const script = document.createElement('script');
script.src = chrome.extension.getURL('page.js');

(document.head || document.documentElement).appendChild(script);
