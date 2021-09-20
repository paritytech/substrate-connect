import { ConnectionManager } from './ConnectionManager';
import westend from '../../public/assets/westend.json';
import kusama from '../../public/assets/kusama.json';
import polkadot from '../../public/assets/polkadot.json';
import rococo from '../../public/assets/rococo.json';
import { logger } from '@polkadot/util';
import { isEmpty } from '../utils/utils'
import settings from './settings.json';

export interface Background extends Window {
  manager: ConnectionManager
}

declare let window: Background;

const manager = window.manager = new ConnectionManager();

type RelayType = Map<string, string>

export const relayChains: RelayType = new Map<string, string>([
  ["polkadot", JSON.stringify(polkadot)],
  ["kusama", JSON.stringify(kusama)],
  ["rococo", JSON.stringify(rococo)],
  ["westend", JSON.stringify(westend)]
])

const l = logger('Extension');
export interface RequestRpcSend {
  method: string;
  params: unknown[];
}

const init = async () => {
  try {
    await manager.initSmoldot();
    for(const [key, value] of relayChains.entries()) {
      const rpcCallback = (rpc: string) => {
        console.warn(`Got RPC from ${key} dummy chain: ${rpc}`);
      };
      await manager.addChain(key, value, rpcCallback)
        .catch(err => l.error('Error', err));
    }
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

chrome.runtime.onConnect.addListener(port => {
  manager.addApp(port);
});

chrome.storage.sync.get(['notifications'], (result) => {
  if (isEmpty(result)) {
    // Setup default settings
    chrome.storage.sync.set({notifications: settings.notifications}, () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      }
    });
  }
});

// TODO (nik): once extension is on chrome/ff stores we need to take advantage 
// of the onBrowserUpdateAvailable and onUpdateAvailable lifecycle event
// NOTE: onSuspend could be used to cleanup things but async actions are not guaranteed to complete :(
