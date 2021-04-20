/**
 * @description The message from the manager in the extension background
 * that is intended to be sent on to the `ExtensionProvider` in the app.
 */
export interface MessageFromManager {
  type: 'error' | 'rpc';
  payload: string; // JSON encoded RPC response or an error message
}

/**
 * @description ExtensionMessage represents messages sent via 
 * `window.postMessage` from `ExtensionMessageRouter` -> `ExtensionProvider`
 */
export interface ExtensionMessage { data: ExtensionMessageData}
export interface ExtensionMessageData {
  origin: 'content-script';
  message: MessageFromManager
}

/**
 * @description ExtensionListenHandler is a message handler type for receiving 
 * `ProviderMessage` messages from the @substrate/connect `ExtensionProvider`
 * in the extension.
 */
export type ExtensionListenHandler = (message: ProviderMessage) => void;

/**
 * @description extension provides strongly typed convenience wrappers around
 * the `window.postMessage` and `window.addEventListener` APIs used for
 * message passing on the extension side of communication.
 */
export const extension = {
  send: (message: ExtensionMessageData): void => {
    window.postMessage(message, '*');
  },
  listen: (handler: ExtensionListenHandler): void => {
    window.addEventListener('message', handler);
  }
};


/**
 * @description ProviderMessage represents messages sent via 
 * `window.postMessage` from ExtensionProvider -> ExtensionMessageRouter
 */
export interface ProviderMessage { data: ProviderMessageData }
export interface ProviderMessageData {
  origin: 'extension-provider';
  appName: string;
  chainName: string;
  action: 'forward' | 'disconnect';
  message?: MessageToManager
}

/**
 * @description The message from the ExtensionProvider in the app that is 
 * intended to be sent on to the manager in the extension background.
 */
export interface MessageToManager {
  type: 'associate' | 'rpc';
  payload: string; // smoldot name or JSON encoded RPC message
  subscription?: boolean;
}

/**
 * @description ProviderListenHandler is a message handler type for receiving 
 * `ExtensionMessage` messages from the extension in the @substrate/connect
 * `ExtensionProvider`.
 */
export type ProviderListenHandler = (message: ExtensionMessage) => void;

/**
 * @description provider provides properly typed convenience wrappers around
 * the `window.postMessage` and `window.addEventListener` APIs used for
 * message passing on the @substrate/connect `ExtensionProvider` end of
 * communication.
 */
export const provider = {
  send: (message: ProviderMessageData): void => {
    window.postMessage(message, '*');
  },
  listen: (handler: ProviderListenHandler): void => {
    window.addEventListener('message', handler);
  }
};
