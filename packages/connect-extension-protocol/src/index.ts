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

interface ToApplicationHeader {
  origin: "content-script"
}

type ToApplicationChainHeader = ToApplicationHeader & {
  chainId: string
}

interface ToApplicationError {
  type: "error"
  payload: string
}

interface ToApplicationChainReady {
  type: "chain-ready"
}

interface ToApplicationRpc {
  type: "rpc"
  payload: string
}

export type ToApplication = ToApplicationChainHeader &
  (ToApplicationError | ToApplicationChainReady | ToApplicationRpc)

interface ToExtensionHeader {
  origin: "extension-provider"
}

type ToExtensionChainHeader = ToExtensionHeader & {
  chainId: string
}

interface ToExtensionAddChain {
  type: "add-chain"
  payload: { chainSpec: string; parachainSpec?: string }
}

interface ToExtensionAddWellKnownChain {
  type: "add-well-known-chain"
  payload: { name: string; parachainSpec?: string }
}

interface ToExtensionRpc {
  type: "rpc"
  payload: string
}

interface ToExtensionRemoveChain {
  type: "remove-chain"
}

export type ToExtension = ToExtensionChainHeader &
  (
    | ToExtensionAddChain
    | ToExtensionAddWellKnownChain
    | ToExtensionRpc
    | ToExtensionRemoveChain
  )
