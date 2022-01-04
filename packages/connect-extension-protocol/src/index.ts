/**
 * @packageDocumentation
 *
 * In order to understand the protocol you should realise there are actually
 * 2 hops that happen in communication because of the architecture of browser
 * extensions.  The app has to `window.postMessage` messages to the content
 * script that gets injected by the extension. It is the content script that
 * has access to the extension APIs to be able to post messages to the
 * extension background.
 *
 * You can think of the protocol types like layers of an onion. The innermost
 * layer is the original JSON RPC request/responses. Then we wrap extra layers
 * (types) for the other 2 hops which then get peeled off at each hop.
 * The {@link ToExtension} and {@link ToApplication} represents
 * communication between the PolkadotJS provider in the app and the extension
 * (content and background scripts).
 *
 * The {@link ExtensionProvider} is the class in the app.
 * The {@link ExtensionMessageRouter} is the class in the content script.
 * The {@link ConnectionManager} is the class in the extension background.
 */

/**
 * ExtensionMessage represents messages sent via
 * `window.postMessage` from `ExtensionMessageRouter` to `ExtensionProvider`
 * as recieved by the `ExtensionProvider`.
 *
 * @remarks The browser wraps the message putting it in {@link data}
 */
export interface ExtensionMessage {
  data: ToApplication
}
export interface ToApplication {
  /** origin is used to determine which side sent the message **/
  origin: "content-script"
  /** message is telling the `ExtensionProvider` the port has been closed **/
  disconnect?: boolean
  /** Type of the message. Defines how to interpret the {@link payload} */
  type?: "error" | "rpc"
  /** Payload of the message. Either a JSON encoded RPC response or an error message **/
  payload?: string
}

/**
 * ExtensionListenHandler is a message handler type for receiving
 * `ProviderMessage` messages from the \@substrate/connect `ExtensionProvider`
 * in the extension.
 */
export type ExtensionListenHandler = (message: ProviderMessage) => void

/**
 * ProviderMessage represents messages sent via `window.postMessage` from
 * `ExtensionProvider` to `ExtensionMessageRouter` as received by the extension.
 *
 * @remarks The browser wraps the message putting it in {@link data}
 */
export interface ProviderMessage {
  data: ToExtension
}

export interface ToExtension {
  /** origin is used to determine which side sent the message **/
  origin: "extension-provider"
  /** The name of the app to be used for display purposes in the extension UI **/
  appName: string
  /** The uniqueId for extension multiplexing **/
  chainId: number
  /** The name of the blockchain network the app is talking to **/
  chainName: string
  /** What action the `ExtensionMessageRouter` should take **/
  action: "forward" | "connect" | "disconnect"
  /** The message the `ExtensionMessageRouter` should forward to the background **/
  /** Type of the message. Defines how to interpret the {@link payload} */
  type?: "rpc" | "spec"
  /** Payload of the message -  a JSON encoded RPC request **/
  payload?: string
  parachainPayload?: string
}

/**
 * ProviderListenHandler is a message handler type for receiving
 * `ExtensionMessage` messages from the extension in the \@substrate/connect
 * `ExtensionProvider`.
 */
export type ProviderListenHandler = (message: ExtensionMessage) => void

/**
 * provider provides properly typed convenience wrappers around the
 * `window.postMessage` and `window.addEventListener` APIs used for message
 * passing on the \@substrate/connect `ExtensionProvider` end of communication.
 */
export const provider = {
  /** send a message from the app to the extension **/
  send: (message: ToExtension): void => {
    window.postMessage(message, "*")
  },
  /**
   * Listen to messages from the `ExtensionMessageRouter` in the extension sent
   * to the app.
   */
  listen: (handler: ProviderListenHandler): void => {
    window.addEventListener("message", handler)
  },
}
