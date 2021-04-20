/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ConnectionManager } from './ConnectionManager';
import westend from '../../public/assets/westend.json';
import kusama from '../../public/assets/kusama.json';
import polkadot from '../../public/assets/polkadot.json';
export interface Background extends Window {
  manager: ConnectionManager
}

declare let window: Background;

const manager = window.manager = new ConnectionManager();

export interface RequestRpcSend {
  method: string;
  params: unknown[];
}

const createSmoldot = async (name: string, spec: unknown) => {
  const stringifiedSpec = JSON.stringify(spec);
  try {
    await manager.addSmoldot(name, stringifiedSpec);
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
  manager.addApp(port);
});
