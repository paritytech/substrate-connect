export type NetworkTypes = 'kusama' | 'polkadot' | 'westend' | 'kulupu'

export type NetworkStatus =  'connected' | 'ready' | 'disconnecting' | 'disconnected';

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
  status: NetworkStatus;
  isKnown: boolean;
  chainspecPath: string;
}
export interface Network extends ChainSpec {
  parachains?: Parachain[];
}
export interface Parachain extends ChainSpec {
  relaychain: string;
}

// Messages that we send to the app down through the port
export type ExtensionMessageType = 'error' | 'rpc';

export interface ExtensionMessage {
  type: ExtensionMessageType;
  payload: string;
}

// Messages that come from the app
export type AppMessageType = 'associate' | 'rpc';

export interface AppMessage {
  type: AppMessageType;
  payload: string; // smoldot name / json / message_id / subscription_id
  subscription?: boolean;
}

export interface Message {
  data: {
    appName: string;
    chainName: string;
    origin: string;
    message: AppMessage
  }
}

export type NetworkCtx = TabInterface[];
