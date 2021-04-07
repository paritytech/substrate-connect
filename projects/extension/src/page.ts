// import type { Message } from './types';

const pkg_name = process.env.PKG_NAME as string;
const version = process.env.PKG_VERSION as string;

injectExtension();

function injectExtension() {
  const s = document.createElement('span');
  s.id = 'substrateExtension'
  s.setAttribute('name', pkg_name);
  s.setAttribute('version', version);
  document.body.appendChild(s);
}
