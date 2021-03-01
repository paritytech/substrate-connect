import type { Message } from './types';

const PORT_CONTENT = 'content';
//This line opens up a long-lived connection FROM the page TO your background page.
const port = chrome.runtime.connect({ name: PORT_CONTENT });

// send any messages: extension -> page
port.onMessage.addListener((data): void => {
    window.postMessage({ ...data, origin: PORT_CONTENT }, '*');
  });

// all messages: page -> extension
window.addEventListener('message', ({ data, source }: Message): void => {
    // only allow messages from our window, by the inject
    if (source !== window || data.origin !== 'page') {
        return;
    }
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

// // listen FROM the page TO the content
// port.onMessage.addListener((message, sender) => {
//     console.log('message is ', message, sender);
//     if(message === "hello"){
//         console.log("HELLO!!!", message);
        
//         // communicate something FROM the extension -> TO the page
//         window.postMessage({ message: 'hello', origin: 'content' }, '*');
//     }
//     if (message == 'version') {
//         const manifest = chrome.runtime.getManifest();
//         // const url = chrome.runtime.getURL();
//         console.log('-------- manifest', manifest);

//         // communicate something FROM the extension -> TO the page
//         window.postMessage({ message: 'manifest', origin: 'content' }, '*');
//     }
//     return true;
// });
