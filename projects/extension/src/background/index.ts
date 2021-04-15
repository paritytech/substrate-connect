/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ConnectionManager } from './ConnectionManager';
import westend from '../assets/westend.json';
import kusama from '../assets/kusama.json';
import polkadot from '../assets/polkadot.json';
import { debug } from '../utils/debug';
import { AppType } from './types';

const manager = new ConnectionManager();

manager.on('stateChanged', () => {
  debug('CONNECTION MANAGER STATE CHANGED', manager.getState());
});

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
  const westendChainSpec = JSON.stringify(westend);
  const kusamaChainSpec = JSON.stringify(kusama);
  const polkadotChainSpec = JSON.stringify(polkadot);
  manager.addSmoldot('westend', westendChainSpec).catch((e) => { 
    console.error('Error creating westend smoldot: ', e); 
  });
  manager.addSmoldot('kusama', kusamaChainSpec).catch((e) => { 
    console.error('Error Creating kusama smoldot', e); 
  });
  manager.addSmoldot('polkadot', polkadotChainSpec).catch((e) => { 
    console.error('Error Creating polkadot smoldot', e); 
  });
});

chrome.runtime.onConnect.addListener((port) => {
  console.log('port onConnect:', port)
  if (port.name === 'substrateExtension') {
    const apps: AppType[] = [];
    // Map the apps that exist in the ConnectionManager to the
    // format that the extension expects
    manager?.apps?.forEach(s => {
      apps.push({
        appName: s.appName,
        name: s.name,
        smoldotName: s.smoldotName,
        state: s.state,
        tabId: s.tabId,
        url: s.url
      });
    })
    port.postMessage({ type: 'info', payload: apps });
  } else {
    manager.addApp(port);
  }
});
