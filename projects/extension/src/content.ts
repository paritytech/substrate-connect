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

// Receive from ExtensionProvider the App "subscribtion"
window.addEventListener('message', ({ data }: Message): void => {
  let appData: AppMessage;
  if (data.origin === EXTENSION_ORIGIN) {
    // TODO: MUST FIX THE CALLS FROM APP INIT AND REST RPC DATA
    const parsedData = JSON.parse(data?.message);
    if (parsedData.type === 'associate') {
    // Associate the app to specific smoldot client
      appData = {
        type: parsedData?.type,
        payload: parsedData?.message?.chainName || ''
      }
    } else {
      appData = {
        type: 'rpc',
        payload: parsedData?.message || ''
      }
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
