/**
 * @description ExtensionMessage represents messages sent via 
 * `window.postMessage` from ExtensionProvider -> ExtensionMessageRouter
 */
export interface ExtensionMessage { data: ExtensionMessageData}
export interface ExtensionMessageData {
  origin: 'content-script';
  message: {
    type: 'error' | 'rpc',
    payload: string;
  }
}

/**
 * @description ProviderMessage represents messages sent via 
 * `window.postMessage` from ExtensionMessageRouter -> ExtensionProvider
 */
export interface ProviderMessage { data: ProviderMessageData }
export interface ProviderMessageData {
  origin: 'extension-provider';
  appName: string;
  chainName: string;
  action: 'forward' | 'disconnect';
  message?: {
    type: 'associate' | 'rpc',
    payload: string;
    subscription?: boolean;
  }
}

