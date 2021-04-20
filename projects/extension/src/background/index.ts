/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ConnectionManager } from './ConnectionManager';
import westend from '../../public/assets/westend.json';
import kusama from '../../public/assets/kusama.json';
import polkadot from '../../public/assets/polkadot.json';
import { debug } from '../utils/debug';
import { AppType } from './types';
import { Network } from '../types';
export interface Background extends Window {
  manager: ConnectionManager
}

declare let window: Background;

const manager = window.manager = new ConnectionManager();
const networks: Network[] = [];

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

const createSmoldot = async (name: string, spec: unknown) => {
  const stringifiedSpec = JSON.stringify(spec);
  try {
    await manager.addSmoldot(name, stringifiedSpec);
    networks.push({
      name: name,
      status: 'connected',
      isKnown: true,
      chainspecPath: `${name}.json`
    });
  } catch (e) {
    console.error(`Error creating ${name} smoldot: ${e}`); 
  }
}

chrome.runtime.onInstalled.addListener(() => {
  void createSmoldot('polkadot', polkadot);
  void createSmoldot('kusama', kusama);
  void createSmoldot('westend', westend);
});

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'substrateExtension') {
    const apps: AppType[] = [];
    // Map the apps that exist in the ConnectionManager to the
    // format that the extension expects
    manager?.apps?.forEach(a => {
      apps.push({
        appName: a.appName,
        name: a.name,
        smoldotName: a.smoldotName,
        state: a.state,
        tabId: a.tabId,
        url: a.url
      });
    })

    port.postMessage({ type: 'info', about: 'apps', payload: apps });
    port.postMessage({ type: 'info', about: 'networks', payload: networks });
  } else {
    manager.addApp(port);
  }
});
