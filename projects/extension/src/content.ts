import type { AppMsg } from './types';

const PORT_CONTENT = 'substrate';
const EXTENSION_ORIGIN = 'extension-provider';
//This line opens up a long-lived connection FROM the page TO your background page.

const port = chrome.runtime.connect({ name: PORT_CONTENT });

export type AppMessageType = 'associate' | 'rpc';
export interface AppMessage {
  type: AppMessageType;
  payload: string; // name of the network or an rpc string (json stringified RPC message)
}

// Receive from ExtensionProvider the App "subscribtion"
window.addEventListener('message', ({ data }: AppMsg): void => {
  let appData: AppMessage;
  if (data.origin === EXTENSION_ORIGIN) {
    console.log('data are and will be: ', data);
    // Associate the app to specific smoldot client
    appData = {
      type: 'associate',
      payload: 'westend'
    }
    port.postMessage({ ...appData, origin: EXTENSION_ORIGIN});
    
    // // send the rpc request
    // appData = {
    //   type: 'rpc',
    //   payload: 'test'
    // }
    // port.postMessage({ ...appData, origin: EXTENSION_ORIGIN});
  }
});

// Listen from window: website -> extension (content)
// window.addEventListener('message', ({ data }: Message): void => {
//   // only allow messages from our window, by the inject
//   if (data.origin === EXTENSION_ORIGIN) {
//       // send to background
//       data.id = '1';
//       console.log('send to background')
//       port.postMessage({ ...data, origin: EXTENSION_ORIGIN});
//       //send back to window
//       // window.postMessage({message:'something clever here'}, '*');
//   } else {
//     return;
//   }
// });

// send any messages: extension -> page
port.onMessage.addListener((data): void => {
  console.log('FROM BACKGROUND -> EXTENSION', data);
  window.postMessage({ ...data, origin: PORT_CONTENT }, '*');
});

// inject page.ts to the tab
const script = document.createElement('script');
script.src = chrome.extension.getURL('page.js');

(document.head || document.documentElement).appendChild(script);
