import type { Message } from './types';

// From POLKADOT-JS EXTENSION
// import { enable, handleResponse, redirectIfPhishing } from '@polkadot/extension-base/page';

// setup a response listener (events created by the loader for extension responses)
window.addEventListener('message', ({ data, source }: Message): void => {
  // only allow messages from our window, by the loader
  if (source !== window || data.origin !== 'content') {
    return;
  }

  console.log('data', data);
  console.log('source', source);

  // From POLKADOT-JS EXTENSION
  // if (data.id) {
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   handleResponse(data as any);
  // } else {
  //   console.error('Missing id for response.');
  // }
});

// From POLKADOT-JS EXTENSION
// redirectIfPhishing().then((gotRedirected) => {
//   if (!gotRedirected) {
//     inject();
//   }
// }).catch((e) => {
//   console.warn(`Unable to determine if the site is in the phishing list: ${(e as Error).message}`);
//   inject();
// });

// function inject () {
//   injectExtension(enable, {
//     name: 'polkadot-js',
//     version: process.env.PKG_VERSION as string
//   });
// }
