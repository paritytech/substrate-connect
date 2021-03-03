/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ConnectionManager } from './ConnectionManager';

// secure ws - test chainspec
import westend from '../assets/westend-wss.json';
// Non secure ws - test chainspec
// import westend from '../assets/westend-ws.json';
const manager = new ConnectionManager();

chrome.runtime.onConnect.addListener(() => {
  manager.addSmoldot('westend', JSON.stringify(westend))
    .catch((e) => { console.error(e); });
});
