import * as smoldot from '@substrate/smoldot-light';
import EventEmitter from 'eventemitter3';
import StrictEventEmitter from 'strict-event-emitter-types';
import { HealthChecker, SmoldotChain, SmoldotHealth } from '@substrate/smoldot-light';
import { Network } from '../types';

export interface App {
  appName: string;
  chain?: SmoldotChain;
  chainName: string;
  name: string;
  tabId: number;
  url?: string;
  port: chrome.runtime.Port;
  healthChecker?: HealthChecker;
  healthStatus?: SmoldotHealth;
  state: AppState;
}

export type AppState = 'connected' | 'disconnected';

export interface AppInfo {
  name: string;
  tabId: number;
  networks: NetworkState[];
}

export interface State {
  apps: AppInfo[];
}

export interface NetworkState {
  name: string;
}

export interface StateEvents {
  stateChanged: State;
}

export type StateEmitter = StrictEventEmitter<EventEmitter, StateEvents>;

export interface ConnectionManagerInterface {
  registerApp: (app: App) => void;
  unregisterApp: (app: App) => void;
  addChain: (
    spec: string,
    jsonRpcCallback?: smoldot.SmoldotJsonRpcCallback,
    tabId?: number) => Promise<Network>;
}

