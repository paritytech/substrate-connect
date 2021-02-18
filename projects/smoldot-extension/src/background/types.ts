// Messages that come from the app
export type AppMessageType = 'associate' | 'rpc';

export interface AppMessage {
  type: AppMessageType;
  payload: string; // smoldot name / json / message_id / subscription_id
}

// Messages that we send to the app
export type ExtensionMessageType = 'error' | 'rpc';

export interface ExtensionMessage {
  type: ExtensionMessageType;
  payload: string;
}

export type AppState = 'connected' | 'ready' | 'disconnecting' | 'disconnected';

export interface MessageIDMapping {
  readonly appID: number;
  readonly smoldotID: number;
}

export interface SubscriptionMapping {
  readonly appIDForRequest: number;
  subID: number | string  | undefined;
}

export interface ClientManagerInterface {
  hasClientFor: (name: string) => boolean;
  sendRpcMessageTo: (name: string, message: any) => number;
}
