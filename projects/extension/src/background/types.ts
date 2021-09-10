import * as smoldot from '@substrate/smoldot-light';
import { AppMediator } from './AppMediator';
import EventEmitter from 'eventemitter3';
import StrictEventEmitter from 'strict-event-emitter-types';

export interface InitAppNameSpec {
  id: string,
  chainName: string,
  origin: string,
  uAppName: string,
  chainSpec?: string
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
  registerApp: (app: AppMediator) => void;
  unregisterApp: (app: AppMediator) => void;
  addChain: (
    spec: string,
    jsonRpcCallback?: smoldot.SmoldotJsonRpcCallback,
    relayChain?: smoldot.SmoldotChain) => Promise<smoldot.SmoldotChain>;
}

