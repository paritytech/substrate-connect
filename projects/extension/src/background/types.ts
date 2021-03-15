import { AppMediator } from './AppMediator';
// Messages that come from the app
export type AppMessageType = 'associate' | 'rpc';

export interface AppMessage {
  type: AppMessageType;
  payload: string; // smoldot name / json / message_id / subscription_id
  subscription?: boolean;
}

// Messages that we send to the app
export type ExtensionMessageType = 'error' | 'rpc';

export interface ExtensionMessage {
  type: ExtensionMessageType;
  payload: string;
}

export type AppState = 'connected' | 'ready' | 'disconnecting' | 'disconnected';

export interface MessageIDMapping {
  readonly appID: number | undefined;
  readonly smoldotID: number;
}

export interface SubscriptionMapping {
  readonly appIDForRequest: number | undefined;
  subID: number | string  | undefined;
  method: string;
}

export interface ConnectionManagerInterface {
  hasClientFor: (name: string) => boolean;
  sendRpcMessageTo: (name: string, message: JsonRpcRequest) => number;
  registerAppWithSmoldot(app: AppMediator, name: string);
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
