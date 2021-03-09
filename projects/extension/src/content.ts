import type { Message } from './types';

const PORT_CONTENT = 'extension_content';
//This line opens up a long-lived connection FROM the page TO your background page.
const port = chrome.runtime.connect({ name: PORT_CONTENT });

// all messages: website -> extension (content)
window.addEventListener('message', ({ data, source }: Message): void => {
    // only allow messages from our window, by the inject
    if (data.origin !== 'page') {
      return;
    }
    console.log('all messages: website -> extension (content)', data, source);
    port.postMessage(data);
});

// send any messages: extension -> page
port.onMessage.addListener((data): void => {
  console.log('send any messages: extension -> page', data);
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
