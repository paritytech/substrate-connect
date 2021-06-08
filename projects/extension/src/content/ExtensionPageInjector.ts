import { debug } from '../utils/debug';

const pkg_name = process.env.PKG_NAME as string;
const version = process.env.PKG_VERSION as string;

/* spanId is the wellknown id of the span to be injected */
export const spanId = 'substrateExtension';

/* ExtensionPageInjector is the part of the content script that injects a span
* with a wellknown id into the page so that a page that is using substrate
* connect can detect that the extension is installed and use it instead of 
* instantiating an instance of smoldot in the page itself
*/
export class ExtensionPageInjector {
  constructor() {
    debug('SETTING UP INJECTOR');
    // inject as soon as the dom is available
    window.document.addEventListener('readystatechange', () => {
      debug('READYSTATE CHANGED');
      if (window.document.readyState === 'interactive') {
        this.inject();
      }
    });
  }

  /* inject the span into the page */
  inject(): void {
    debug('INJECTING EXTENSION SPAN', spanId);

    const s = document.createElement('span');
    s.id = spanId;
    s.setAttribute('name', pkg_name);
    s.setAttribute('version', version);
    document.body.appendChild(s);
  }
}
