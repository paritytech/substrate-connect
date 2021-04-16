/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ExtensionMessageRouter } from './ExtensionMessageRouter';

const router = new ExtensionMessageRouter();
router.listen();

// inject page.ts to the tab
const script = document.createElement('script');
script.src = chrome.extension.getURL('page.js');

(document.head || document.documentElement).appendChild(script);
