/**
 * @packageDocumentation
 *
 * This module contains the types and explanations of the communication
 * protocol between the JavaScript code embedded in a web page and the
 * substrate-connect extension.
 *
 * # Overview
 *
 * TODO: explain how the web page can detect whether the extension is installed
 *
 * If a web page wants to use the features of the substrate-connect extension,
 * it can do so by sending messages on its `window` by using
 * `Window.postMessage`. These messages must conform to the {@link ToExtension}
 * interface defined below.
 *
 * The substrate-connect extension (more precisely, its content-script) listens
 * for "message" events (using `window.addEventListener("message", ...)`) and
 * replies by sending back messages using `Window.postMessage` as well. The
 * messages sent by the extension conform to the {@link ToApplication}
 * interface defined below.
 *
 * # Detailed usage
 *
 * In order to ask the substrate-connect extension to connect to a certain
 * chain, the web page must:
 *
 * - Randomly generate the so-called `chainId`, a string that will be used
 * to identify this specific chain connection during its lifetime. At least
 * 48 bits of entropy are recommended in order to avoid accidentally
 * generating the same string multiple times.
 * - Send a {@link ToExtensionAddChain} message (using `Window.postMessage`,
 * as explained in the previous section) containing this `chainid` and the
 * chain specification of the chain to connect to.
 *
 * Instead of a {@link ToExtensionAddChain} message, the web page can
 * alternatively send a {@link ToExtensionAddWellKnownChain} message and pass
 * a chain name recognized by the extension such as "polkadot" or "kusama", in
 * which case the extension will use the chain specification stored internally.
 * Doing so provides multiple advantages such as less bandwidth usage (as the
 * web page doesn't have to download the chain specification), and a faster
 * initialization as the extension is most likely already connected to that
 * chain.
 *
 * After a {@link ToExtensionAddChain} or a
 * {@link ToExtensionAddWellKnownChain} message has been sent, the extension
 * starts connecting to the chain, and later replies by sending back a
 * {@link ToApplicationChainReady} message in case of success, or a
 * {@link ToApplicationError} message in case of failure. This reply might
 * only be sent back after a few seconds or more, and the web page is
 * encouraged to display some kind of loading screen in the meanwhile.
 *
 * Note that the extension reserves the rights to stop supporting a chain that
 * used to be recognized by {@link ToExtensionAddWellKnownChain}. If the web
 * page has sent a {@link ToExtensionAddWellKnownChain} and receives back a
 * {@link ToApplicationError}, it should automatically fall back to
 * downloading the chain specification and sending a
 * {@link ToExtensionAddChain} instead.
 *
 * After a chain has been successfully initialized (i.e. a
 * {@link ToApplicationChainReady} message has been sent to the web page), the
 * web page can submit JSON-RPC requests and notifications to the chain client
 * by sending {@link ToExtensionRpc} messages. The chain client sends back
 * JSON-RPC responses and notifications using {@link ToApplicationRpc}
 * messages.
 *
 * Once a web page no longer wants to interface with a certain chain, it should
 * send a {@link ToExtensionRemoveChain} message to the extension in order for
 * resources to be de-allocated.
 *
 * At any point in time, the extension can send a {@link ToApplicationError}
 * message to indicate a critical problem with the chain or the extension that
 * prevent execution from continuing. This can include for example the extension
 * being disabled by the user, the underlying client crashing, a lack of
 * memory, etc. If that happens, the web page is encouraged stop using the
 * extension altogether.
 *
 * Note that if the extension sends a {@link ToApplicationError} message,
 * either before of after the chain is ready, the corresponding `chainId` is
 * immeidately considered dead/removed, and the web page doesn't need to send
 * a {@link ToExtensionRemoveChain} message.
 */

interface ToApplicationHeader {
  origin: "content-script"
}

interface ToApplicationError {
  type: "error"
  chainId: string
  payload: string
}

interface ToApplicationChainReady {
  type: "chain-ready"
  chainId: string
}

interface ToApplicationRpc {
  type: "rpc"
  chainId: string
  payload: string
}

export type ToApplication = ToApplicationHeader &
  (ToApplicationError | ToApplicationChainReady | ToApplicationRpc)

interface ToExtensionHeader {
  origin: "extension-provider"
}

interface ToExtensionAddChain {
  type: "add-chain"
  chainId: string
  payload: { chainSpec: string; potentialRelayChainIds: Array<string> }
}

interface ToExtensionAddWellKnownChain {
  type: "add-well-known-chain"
  chainId: string
  payload: string
}

interface ToExtensionRpc {
  type: "rpc"
  chainId: string
  payload: string
}

interface ToExtensionRemoveChain {
  type: "remove-chain"
  chainId: string
}

export type ToExtension = ToExtensionHeader &
  (
    | ToExtensionAddChain
    | ToExtensionAddWellKnownChain
    | ToExtensionRpc
    | ToExtensionRemoveChain
  )
