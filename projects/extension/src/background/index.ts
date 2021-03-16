/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ConnectionManager } from './ConnectionManager';
import westend from '../assets/westend-wss.json';     // secure ws - test chainspec
import kusama from '../assets/kusama-ws.json';        // Non secure ws - kusama test chainspec
// import westend from '../assets/westend-ws.json';     // Non secure ws - westend test chainspec
// import polkadot from '../assets/polkadot-ws.json';   // Non secure ws - polkadot test chainspec
// import kutulu from '../assets/kutulu-ws.json';       // Non secure ws - kutulu test chainspec
const manager = new ConnectionManager();

export type AppMessageType = 'associate' | 'rpc';
export interface AppMessage {
  type: AppMessageType;
  payload: string; // name of the network or an rpc string (json stringified RPC message)
}

export interface RequestRpcSend {
  method: string;
  params: unknown[];
}

chrome.runtime.onInstalled.addListener(() => {
  // Create connection for known chains:
  const westendStr = JSON.stringify(westend);
  const kusamaStr = JSON.stringify(kusama);
  manager.addSmoldot('westend', westendStr).catch((e) => { console.error('Westend error: ', e); });
  manager.addSmoldot('kusama', kusamaStr).catch((e) => { console.error('Kusama error: ', e); });
  // Pending for json files
  // manager.addSmoldot('polkadot', polkadotStr).catch((e) => { console.error(e); });
  // manager.addSmoldot('kutulu', kutuluStr).catch((e) => { console.error(e); });
});

chrome.runtime.onConnect.addListener((port) => {
  console.assert(port.name == "substrate");
  manager.addApp(port);
});