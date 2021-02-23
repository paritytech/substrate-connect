import { ConnectionManager } from './ConnectionManager';
import westend from '../assets/westend.json';

const manager = new ConnectionManager();

chrome.runtime.onStartup.addListener(() => {
  manager.addSmoldot('westend', JSON.stringify(westend))
    .catch((e) => { console.error(e); });
});
