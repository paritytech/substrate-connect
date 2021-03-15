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
    type?: string;
    appName?: string;
    chainName?: string;
    message?: string;
  }
}  

export type NetworkCtx = TabInterface[];
