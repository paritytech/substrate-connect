export type NetworkTypes = 'kusama' | 'polkadot' | 'westend' | 'kulupu'
export type NetworkStatus =  'connected' | 'ready' | 'disconnecting' | 'disconnected';

export interface TabInterface {
    tabId: number;
    url: string;
    uApps: uApp[];
}
export type uApp = {
    networks: Network[];
    name: string;
    enabled: boolean;
}

interface ChainSpec {
  name: string;
  logo?: string;
  status: NetworkStatus;
  isKnown: boolean;
  chainspecPath: string;
}
export interface Network extends ChainSpec {
  parachains?: Parachain[];
}
export interface Parachain extends ChainSpec {
  relaychain?: string;
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
  

export type NetworkCtx = TabInterface[];
