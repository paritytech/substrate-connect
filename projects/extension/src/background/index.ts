/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ConnectionManager } from './ConnectionManager';
import westend from '../../public/assets/westend.json';
import kusama from '../../public/assets/kusama.json';
import polkadot from '../../public/assets/polkadot.json';
import { logger } from '@polkadot/util';

export interface Background extends Window {
  manager: ConnectionManager
}

declare let window: Background;

const manager = window.manager = new ConnectionManager();

const l = logger('Extension');
export interface RequestRpcSend {
  method: string;
  params: unknown[];
}

const init = async () => {
  try {
    await manager.initSmoldot();
    await manager.addChain('polkadot', JSON.stringify(polkadot)).catch(err => l.error('Error', err));
    await manager.addChain('kusama', JSON.stringify(kusama)).catch(err => l.error('Error', err));
    await manager.addChain('westend', JSON.stringify(westend)).catch(err => l.error('Error', err));
  } catch (e) {
    l.error(`Error creating smoldot: ${e}`); 
  }
}

chrome.runtime.onInstalled.addListener(() => {
  init().catch(console.error);
});

chrome.runtime.onStartup.addListener(() => {
  init().catch(console.error);
});

chrome.runtime.onConnect.addListener((port) => {
  manager.addApp(port);
});

// TODO (nik): once extension is on chrome/ff stores we need to take advantage 
// of the onBrowserUpdateAvailable and onUpdateAvailable lifecycle event
// NOTE: onSuspend could be used to cleanup things but async actions are not guaranteed to complete :(