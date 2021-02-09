import { Runtime } from 'webextension-polyfill-ts';
import { SmoldotClientManager } from './SmoldotClientManager';
import westend from './assets/westend.json';

const manager = new SmoldotClientManager();

chrome.runtime.onStartup.addListener(async () => {
  await manager.addSmoldot('westend', westend);
});
