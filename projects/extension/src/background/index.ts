/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ConnectionManager } from './ConnectionManager';
import { InitNameSpec } from './types';
// secure ws - test chainspec
// import westend from '../assets/westend-wss.json';
// Non secure ws - test chainspec
// import westend from '../assets/westend-ws.json';
const manager = new ConnectionManager();

chrome.runtime.onConnect.addListener((port) => {
  console.assert(port.name == "extension-provider");
  manager.addApp(port);
  console.log('port', port)
  port.onMessage.addListener((data: InitNameSpec) => {
    console.log('FROM CONTENT', data);
    const { chainName, chainSpec, id } = data;
    chainName &&
    chainSpec &&
    manager.addSmoldot(chainName, chainSpec)
    .then(() => {
      console.log('OK - DO NOT SEND TO CONTENT');

      // port.postMessage({ id, message: 'mpls' });
    })
    .catch((e) => { console.error(e); });
  });
});