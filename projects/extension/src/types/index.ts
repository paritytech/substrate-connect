export type NetworkTypes = 'kusama' | 'polkadot' | 'westend' | 'kulupu'

export type NetworkStatus =  'connected' | 'ready' | 'disconnecting' | 'disconnected';

export interface TabInterface {
    tabId: number;
    url: string;
    uApp: uApp;
}
export type uApp = {
    networks: Network[];
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
  payload: string; // JSON encoded RPC response or an error message
}

// Messages that come from the app
export type AppMessageType = 'associate' | 'rpc';

/* The inner message that was received by the content script to be sent on to
 * the extension background.
 */
export interface AppMessage {
  type: AppMessageType;
  payload: string; // smoldot name or JSON encoded RPC message
  subscription?: boolean;
}

/* A message that is sent by the `ExtenionProvider` calling `window.postMessage`
 * that is received by the content script.
 *
 * The `message` property will either be an `AppMessage` for sending through the
 * port to the background script or the string 'disconnect' to tell the content
 * script to disconnect the port.
 */
export interface ExtensionProviderMessage {
  data: {
    appName: string;
    chainName: string;
    origin: string;
    action: 'forward' | 'disconnect';
    message?: AppMessage;
  }
}

export type NetworkCtx = TabInterface[];
