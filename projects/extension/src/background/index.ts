/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ConnectionManager } from './ConnectionManager';
import { InitNameSpec } from './types';
// secure ws - test chainspec
// import westend from '../assets/westend-wss.json';
// Non secure ws - test chainspec
// import westend from '../assets/westend-ws.json';
const manager = new ConnectionManager();

chrome.runtime.onConnect.addListener((port) => {
  //This is the listener only for specs coming from Page
  port.onMessage.addListener((data: InitNameSpec) => {
    const { chainName, chainSpec } = data;
    chainName &&
    chainSpec &&
    manager.addSmoldot(chainName, chainSpec)
    .catch((e) => { console.error(e); });
  });
});