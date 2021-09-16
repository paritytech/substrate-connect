import * as smoldot from '@substrate/smoldot-light';
import EventEmitter from 'eventemitter3';
import StrictEventEmitter from 'strict-event-emitter-types';
import { HealthChecker, SmoldotChain, SmoldotHealth } from '@substrate/smoldot-light';
import { Network } from '../types';

export interface ReducedApp {
  appName: string;
  chainName: string;
  tabId: number;
  url?: string;
  healthStatus?: SmoldotHealth;
  state: AppState;
}

export interface App extends ReducedApp {
  chain?: SmoldotChain;
  name: string;
  port: chrome.runtime.Port;
  healthChecker?: HealthChecker;
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
    name: string,
    spec: string,
    jsonRpcCallback: smoldot.SmoldotJsonRpcCallback,
    tabId?: number) => Promise<Network>;
}

