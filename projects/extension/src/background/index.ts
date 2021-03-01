/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ConnectionManager } from './ConnectionManager';
// import westendWss from '../assets/westend-wss.json';
import westendWs from '../assets/westend-ws.json';
const manager = new ConnectionManager();

chrome.runtime.onConnect.addListener(() => {
  manager.addSmoldot('westend', JSON.stringify(westendWs))
    .catch((e) => { console.error(e); });
});
