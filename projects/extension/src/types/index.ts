import * as smoldot from '@substrate/smoldot-light';

export type NetworkTypes = 'kusama' | 'polkadot' | 'westend' | 'kulupu'

export type NetworkStatus = 'connected' | 'disconnecting' | 'disconnected';

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
  chain: smoldot.SmoldotChain;
  parachains?: Parachain[];
}
export interface Parachain extends ChainSpec {
  relaychain: string;
}

export type NetworkCtx = TabInterface[];
