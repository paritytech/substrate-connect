import { AppMediator } from '../background/AppMediator';
import { ExtensionAction, Statuses } from './enums';
import EventEmitter from 'eventemitter3';
import StrictEventEmitter from 'strict-event-emitter-types';

export interface MsgExchangePopup {
  ext: string;
  msg: string;
  tabId?: number;
  action: ExtensionAction
}

export interface TabInterface {
    tabId: number | undefined;
    url: string | undefined;
    uApp: uApp;
    isActive?: boolean;
}
export type uApp = {
    networks: string[]; // TODO: for now pass strings in order to make the v0 prototype
    // networks: Network[]; // This should be activated for parachains and v1
    name: string;
    enabled: boolean;
}

interface ChainSpec {
  name: string;
  icon?: string;
  status: Statuses;
  isKnown: boolean;
  chainspecPath: string;
}
export interface Network extends ChainSpec {
  parachains?: Parachain[];
}
export interface Parachain extends ChainSpec {
  relaychain: string;
}

export type NetworkCtx = TabInterface[];

export interface InitAppNameSpec {
  id: string,
  chainName: string,
  origin: string,
  uAppName: string,
  chainSpec?: string
}

export interface State {
  apps: AppState[];
}

export interface AppState {
  name: string;
  tabId: number;
  networks: NetworkState[];
}

interface NetworkState {
  name: string;
}

export interface MessageIDMapping {
  readonly appID: number | undefined;
  readonly smoldotID: number;
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
