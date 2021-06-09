/**
 * `MessageFromManager` represents messages from the manager in the extension
 * background that are intended to be sent on to the `ExtensionProvider` in the
 * app.
 */
export interface MessageFromManager {
  /** Type of the message. Defines how to interpret the {@link payload} */
  type: 'error' | 'rpc';
  /** Payload of the message. Either a JSON encoded RPC response or an error message **/
  payload: string;
}

/**
 * ExtensionMessage represents messages sent via 
 * `window.postMessage` from `ExtensionMessageRouter` to `ExtensionProvider`
 * as recieved by the `ExtensionProvider`.
 *
 * @remarks The browser wraps the message putting it in {@link data}
 */
export interface ExtensionMessage { data: ExtensionMessageData}
export interface ExtensionMessageData {
  /** origin is used to determine which side sent the message **/
  origin: 'content-script';
  /** message is telling the `ExtensionProvider` the port has been closed **/
  disconnect?: boolean;
  /** message is the message from the manager to be forwarded to the app **/
  message?: MessageFromManager
}

/**
 * ExtensionListenHandler is a message handler type for receiving 
 * `ProviderMessage` messages from the \@substrate/connect `ExtensionProvider`
 * in the extension.
 */
export type ExtensionListenHandler = (message: ProviderMessage) => void;

/**
 * extension provides strongly typed convenience wrappers around
 * the `window.postMessage` and `window.addEventListener` APIs used for
 * message passing on the extension side of communication.
 */
export const extension = {
  /** send a message from the extension to the app **/
  send: (message: ExtensionMessageData): void => {
    window.postMessage(message, '*');
  },
  /**
   * Listen to messages from the `ExtensionProvider` in the app sent to 
   * the extension.
   */
  listen: (handler: ExtensionListenHandler): void => {
    window.addEventListener('message', handler);
  }
};


/**
 * ProviderMessage represents messages sent via `window.postMessage` from
 * `ExtensionProvider` to `ExtensionMessageRouter` as received by the extension.
 *
 * @remarks The browser wraps the message putting it in {@link data}
 */
export interface ProviderMessage { data: ProviderMessageData }
export interface ProviderMessageData {
  /** origin is used to determine which side sent the message **/
  origin: 'extension-provider';
  /** The name of the app to be used for display purposes in the extension UI **/
  appName: string;
  /** The name of the blockchain network the app is talking to **/
  chainName: string;
  /** What action the `ExtensionMessageRouter` should take **/
  action: 'forward' | 'connect' | 'disconnect';
  /** The message the `ExtensionMessageRouter` should forward to the background **/
  message?: MessageToManager
}

/**
 * The message from the `ExtensionProvider` in the app that is intended to be
 * sent on to the manager in the extension background.
 */
export interface MessageToManager {
  /** Type of the message. Defines how to interpret the {@link payload} */
  type: 'associate' | 'rpc';
  /** Payload of the message. Either a JSON encoded RPC response or the name of a network **/
  payload: string; // smoldot name or JSON encoded RPC message
  /** whether an RPC message is a subscription or not **/
  subscription?: boolean;
}

/**
 * ProviderListenHandler is a message handler type for receiving
 * `ExtensionMessage` messages from the extension in the \@substrate/connect
 * `ExtensionProvider`.
 */
export type ProviderListenHandler = (message: ExtensionMessage) => void;

/**
 * provider provides properly typed convenience wrappers around the
 * `window.postMessage` and `window.addEventListener` APIs used for message
 * passing on the \@substrate/connect `ExtensionProvider` end of communication.
 */
export const provider = {
  /** send a message from the app to the extension **/
  send: (message: ProviderMessageData): void => {
    window.postMessage(message, '*');
  },
  /**
   * Listen to messages from the `ExtensionMessageRouter` in the extension sent
   * to the app.
   */
  listen: (handler: ProviderListenHandler): void => {
    window.addEventListener('message', handler);
  }
};
