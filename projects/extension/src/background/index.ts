/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ConnectionManager } from './ConnectionManager';
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
  // manager.addSmoldot('polkadot', polkadotStr).catch((e) => { console.error(e); });
  // manager.addSmoldot('kutulu', kutuluStr).catch((e) => { console.error(e); });
});

chrome.runtime.onConnect.addListener((port) => {
  console.assert(port.name == "substrate");
  port.onMessage.addListener((data: AppMessage) => {
    console.log(data)
    if (data.type === 'associate') {
      const appName = port.sender?.tab?.id?.toString() || '';
      manager.addApp(port, appName, data.payload);  
    } else if (data.type === 'rpc') {
      console.log('rpc', data)
      // Find out if app exists in manager. IF NOT add it. IF SO - pass the message to the app
      const method: string = JSON.parse(data.payload)?.method;
      const params: unknown[] = JSON.parse(data.payload)?.params || [];
      const jRpcs: RequestRpcSend = { method, params }
      manager.sendRpcMessageTo('westend', jRpcs);
      port.postMessage(data);
      // port.postMessage({message: 'this is a message'})
    }
  });
});