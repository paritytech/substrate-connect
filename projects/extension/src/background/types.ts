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

export type AppState = 'connected' | 'disconnecting' | 'disconnected';

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

export interface MessageIDMapping {
  readonly appID: number | undefined;
  readonly chainID: number;
}

export interface SubscriptionMapping {
  readonly appIDForRequest: number | undefined;
  subID: number | string  | undefined;
  method: string;
}

export interface StateEvents {
  stateChanged: State;
}

export type StateEmitter = StrictEventEmitter<EventEmitter, StateEvents>;

export interface ConnectionManagerInterface {
  hasClientFor: (name: string) => boolean;
  sendRpcMessageTo: (name: string, message: JsonRpcRequest) => number;
  registerApp: (app: AppMediator, name: string) => void;
  unregisterApp: (app: AppMediator, name: string) => void;
}

export interface JsonRpcObject {
  id?: number;
  jsonrpc: string;
}

export interface JsonRpcRequest extends JsonRpcObject {
  method: string;
  params: unknown[];
}

export interface JsonRpcResponseBaseError {
  code: number;
  data?: number | string;
  message: string;
}

export interface JsonRpcResponseSingle {
  error?: JsonRpcResponseBaseError;
  result?: unknown;
}

export interface JsonRpcResponseSubscription {
  method?: string;
  params?: {
    error?: JsonRpcResponseBaseError;
    result: unknown;
    subscription: number | string;
  };
}

export type JsonRpcResponseBase = JsonRpcResponseSingle & JsonRpcResponseSubscription;

export type JsonRpcResponse = JsonRpcObject & JsonRpcResponseBase
