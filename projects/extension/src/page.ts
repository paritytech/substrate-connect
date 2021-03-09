import type { Message } from './types';

const name = process.env.PKG_NAME as string;
const version = process.env.PKG_VERSION as string;

// setup a response listener (events created by the loader for extension responses)
window.addEventListener('message', ({ data, source }: Message): void => {
  // only allow messages from our window, by the loader
  if (source !== window || data.origin !== 'content') {
    return;
  }
  console.log('data', data,' source', source)
});

injectExtension();

function injectExtension() {
  const s = document.createElement('substrate');
  s.id = 'substrateExtension'
  s.setAttribute('name', name);
  s.setAttribute('version', version);
  document.body.appendChild(s);
}
