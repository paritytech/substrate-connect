export type NetworkTypes = 'kusama' | 'polkadot' | 'westend' | 'kulupu'
export type NetworkStatus =  'connected' | 'ready' | 'disconnecting' | 'disconnected';

export interface TabInterface {
    tabId: number;
    url: string;
    uApps: uApp[];
}
export type uApp = {
    networks: Networks[];
    name: string;
    enabled: boolean;
}

export type Networks = {
    name: NetworkTypes;
    status: NetworkStatus; 
}
export interface Message extends MessageEvent {
  data: {
    error?: string;
    id: string;
    origin: string;
    response?: string;
    subscription?: string;
  }
}

export interface AppMsg extends MessageEvent {
  data: {
    id: string;
    appName: string;
    message?: string;
    origin: string;
    response?: string;
  }
}
  

export type NetworkCtx = TabInterface[];
