import EventEmitter from 'eventemitter3';
import StrictEventEmitter from 'strict-event-emitter-types';

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
