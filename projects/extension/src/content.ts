/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { Message } from './types';
const PORT_CONTENT = 'substrate';
const SMOLDOT_CONTENT = 'smoldot';
const EXTENSION_ORIGIN = 'extension-provider';
//This line opens up a long-lived connection FROM the page TO your background page.

const port = chrome.runtime.connect({ name: PORT_CONTENT });

export type AppMessageType = 'associate' | 'rpc';
export interface AppMessage {
  type: AppMessageType;
  payload: string; // name of the network or an rpc string (json stringified RPC message)
}

// Receive from ExtensionProvider the App "subscription"
window.addEventListener('message', ({ data }: Message): void => {
  let appData: AppMessage;
  if (data.origin === EXTENSION_ORIGIN) {
    const conv = data?.message as unknown as AppMessage;
    if (conv?.type === 'associate') {
      const chainName: string = JSON.parse(conv?.payload).chainName;
    // Associate the app to specific smoldot client
      appData = {
        type: conv?.type,
        payload: chainName
      }
    } else {
      appData = JSON.parse(data?.message || '');
    }
    port.postMessage({ ...appData, origin: EXTENSION_ORIGIN});
  }
});

// send any messages: extension -> page
port.onMessage.addListener((data): void => {
  window.postMessage({ message: data?.payload, origin: SMOLDOT_CONTENT }, '*');
});

// inject page.ts to the tab
const script = document.createElement('script');
script.src = chrome.extension.getURL('page.js');

(document.head || document.documentElement).appendChild(script);
