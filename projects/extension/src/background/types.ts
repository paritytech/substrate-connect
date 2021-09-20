import * as smoldot from '@substrate/smoldot-light';
import EventEmitter from 'eventemitter3';
import StrictEventEmitter from 'strict-event-emitter-types';
import { HealthChecker, SmoldotChain, SmoldotHealth } from '@substrate/smoldot-light';
import { Network } from '../types';

export interface ExposedAppInfo {
  appName: string;
  chainName: string;
  tabId: number;
  url?: string;
  healthStatus?: SmoldotHealth;
  pendingRequests: string[];
  state: AppState;
}

export interface App extends ExposedAppInfo {
  chain?: SmoldotChain;
  name: string;
  port: chrome.runtime.Port;
  healthChecker?: HealthChecker;
}

export type AppState = 'connected' | 'disconnected';

export interface PopupAppInfo {
  name: string;
  tabId: number;
  networks: NetworkState[];
}

export interface State {
  apps: PopupAppInfo[];
}

export interface NetworkState {
  name: string;
}

export interface StateEvents {
  stateChanged: State;
  appsChanged: ExposedAppInfo[];
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

