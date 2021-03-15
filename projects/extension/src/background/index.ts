/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ConnectionManager } from './ConnectionManager';
import { RequestRpcSend } from './types';
// secure ws - test chainspec
import westend from '../assets/westend-wss.json';
// Non secure ws - westend test chainspec
// import westend from '../assets/westend-ws.json';
// Non secure ws - westend test chainspec
import kusama from '../assets/kusama-ws.json';
const manager = new ConnectionManager();

export type AppMessageType = 'associate' | 'rpc';
export interface AppMessage {
  type: AppMessageType;
  payload: string; // name of the network or an rpc string (json stringified RPC message)
}


chrome.runtime.onInstalled.addListener(() => {
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
  port.onMessage.addListener((data: AppMessage) => {
    if (data.type === 'associate') {
      const appName = port.sender?.tab?.id?.toString() || '';
      manager.addApp(port, appName, data.payload);  
    } else if (data.type === 'rpc') {
      // Find out if app exists in manager. IF NOT add it. IF SO - pass the message to the app
      const lala: RequestRpcSend = { 
        method: JSON.parse(data.payload)?.method,
        params: JSON.parse(data.payload)?.params || []
      }
      manager.sendRpcMessageTo('westend', lala);
      port.postMessage(data);
      // port.postMessage({message: 'this is a message'})
    }
  });
});