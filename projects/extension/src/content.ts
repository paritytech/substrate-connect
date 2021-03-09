import type { Message } from './types';

const PORT_CONTENT = 'content';
//This line opens up a long-lived connection FROM the page TO your background page.
const port = chrome.runtime.connect({ name: PORT_CONTENT });

// send any messages: extension -> page
port.onMessage.addListener((data): void => {
  console.log('data from extension -> page', data);
    window.postMessage({ ...data, origin: PORT_CONTENT }, '*');
  });

// all messages: page -> extension
window.addEventListener('message', ({ data, source }: Message): void => {
    // only allow messages from our window, by the inject
    if (source !== window || data.origin !== 'page') {
        return;
    }
    console.log('data from page -> extension', data);
    port.postMessage(data);
});

// inject our data injector
const script = document.createElement('script');

script.src = chrome.extension.getURL('page.js');

script.onload = (): void => {
  // remove the injecting tag when loaded
  if (script.parentNode) {
    script.parentNode.removeChild(script);
  }
};

(document.head || document.documentElement).appendChild(script);
