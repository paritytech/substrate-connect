import type { Message } from './types';

const PORT_CONTENT = 'substrate';
const EXTENSION_ORIGIN = 'extension-provider';
//This line opens up a long-lived connection FROM the page TO your background page.
const port = chrome.runtime.connect({ name: PORT_CONTENT });

// Listen from window: website -> extension (content)
window.addEventListener('message', ({ data }: Message): void => {
  console.log('WEBSITE -> EXTENSION (content)', data);
  // only allow messages from our window, by the inject
  if (data.origin === EXTENSION_ORIGIN) {
      // send to background
      console.log('send to background')
      port.postMessage({ ...data, origin: EXTENSION_ORIGIN});
      //send back to window
      window.postMessage({message:'ahm'}, '*');
  } else {
    return;
  }
});

// send any messages: extension -> page
port.onMessage.addListener((data): void => {
  console.log('FROM BACKGROUND -> EXTENSION', data);
  window.postMessage({ ...data, origin: PORT_CONTENT }, '*');
});

// inject page.ts to the tab
const script = document.createElement('script');
script.src = chrome.extension.getURL('page.js');

// script.onload = (): void => {
//   // remove the injecting tag when loaded
//   if (script.parentNode) {
//     script.parentNode.removeChild(script);
//   }
// };

(document.head || document.documentElement).appendChild(script);
