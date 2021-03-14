/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ConnectionManager } from './ConnectionManager';
import { InitAppNameSpec } from './types';
// secure ws - test chainspec
import westend from '../assets/westend-wss.json';
// Non secure ws - westend test chainspec
// import westend from '../assets/westend-ws.json';
// Non secure ws - westend test chainspec
import kusama from '../assets/kusama-ws.json';
const manager = new ConnectionManager();


chrome.runtime.onInstalled.addListener(() => {
  console.log('I got installed and connected to all the chains')
  // Create connection for known chains:
  const westendStr = JSON.stringify(westend);
  const kusamaStr = JSON.stringify(kusama);
  manager.addSmoldot('westend', westendStr).catch((e) => { console.error('Westend error: ', e); });
  manager.addSmoldot('kusama', kusamaStr).catch((e) => { console.error('Kusama error: ', e); });
  // manager.addSmoldot('polkadot', polkadotStr).catch((e) => { console.error(e); });
  // manager.addSmoldot('kutulu', kutuluStr).catch((e) => { console.error(e); });
});

chrome.runtime.onConnect.addListener((port) => {
  console.assert(port.name == "substrate");
  port.onMessage.addListener((data: InitAppNameSpec) => {
    // Find out if app exists in manager. IF NOT add it. IF SO - pass the message to the app
    const appName = port.sender?.tab?.id?.toString() || '';
    manager.addApp(port, appName, data);
    console.log('FROM CONTENT', data);
    // port.postMessage({message: 'this is a message'})
  });
});