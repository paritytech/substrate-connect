/**
 *
 * This module contains the types and explanations of the communication
 * protocol between the JavaScript code embedded in a web page and the
 * substrate-connect extension.
 *
 * # Overview
 *
 * If a web page wants to use the features of the substrate-connect extension,
 * it must first check whether the extension is available by checking whether
 * there exists an element on the DOM whose `id` is equal to
 * {@link DOM_ELEMENT_ID}. This DOM element is automatically inserted by
 * the extension when the page loads.
 *
 * If so, the web page can make use of the extension by sending messages on
 * its `window` by using `Window.postMessage`. These messages must conform to
 * the {@link ToExtension} interface defined below.
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
 * specification of the chain to connect to.
 *
 * Instead of a {@link ToExtensionAddChain} message, the web page can
 * alternatively send a {@link ToExtensionAddWellKnownChain} message and pass
 * a chain name recognized by the extension such as "polkadot" or "ksmcc3", in
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
 * resources to be de-allocated. This can also be done before a
 * {@link ToApplicationChainReady} message has been sent back.
 *
 * At any point in time after the chain has been initialized, the extension
 * can send a {@link ToApplicationError} message to indicate a critical problem
 * with the chain or the extension that prevents execution from continuing.
 * This can include for example the extension being disabled by the user, the
 * underlying client crashing, an internal error, etc. Contrary to
 * {@link ToApplicationError} messages *before* a chain has been initialized,
 * {@link ToApplicationError} messages that happen *after* a chain has been
 * initialized are rare and serious. If that happens, the web page is
 * encouraged to remove all of its existing chains and stop using the extension
 * altogether.
 *
 * Note that if the extension sends a {@link ToApplicationError} message,
 * either before of after the chain is ready, the corresponding `chainId` is
 * immediately considered dead/removed, and the web page doesn't need to send
 * a {@link ToExtensionRemoveChain} message.
 *
 * # Other extensions implementing this protocol
 *
 * While the documentation above refers to the substrate-connect extension in
 * particular, any other browser extension is free to implement this protocol
 * in order to pretend to be the substrate-connect extension.
 *
 * In order to avoid conflicts when multiple different extensions implement
 * this protocol, extensions must check whether there already exists an element
 * on the DOM whose `id` is equal to {@link DOM_ELEMENT_ID} before
 * creating one and listening for events.
 *
 * @packageDocumentation
 */

// READ THIS BEFORE MODIFYING ANYTHING BELOW
//
// This file contains the communication protocol between the web page and
// extension. If you modify it, existing web pages will still continue to use
// the previous version until they upgrade, which can take a long time.
// Similarly, some users will still have versions of the extension installed
// that use of the previous version of this protocol. If the modifications
// to this protocol aren't done carefully, web pages might no longer being able
// to talk to the extension, or worse: try to talk to the extension and
// throw exceptions because their assumptions are violated. As such, be
// extremely careful when doing modifications: either the modifications are
// completely backwards-compatible, or an upgrade path must be carefully
// planned.

/**
 * `id` of the DOM elemeent automatically inserted by the extension when a web page loads.
 */
export const DOM_ELEMENT_ID = "substrateConnectExtensionAvailable"

/**
 * Messages sent by the extension always conform to this interface.
 */
export type ToApplication = ToApplicationHeader &
  (ToApplicationError | ToApplicationChainReady | ToApplicationRpc)

/**
 * Header present in all messages sent by the extension.
 */
export interface ToApplicationHeader {
  /**
   * Messages sent by the extension are sent on the `window`, alongside with potentially
   * other messages that might be completely unrelated to substrate-connect. This `origin` field
   * indicates that this message indeed comes from the substrate-connect extension.
   */
  origin: "substrate-connect-extension"
}

/**
 * Indicates that the given chain connection has encountered an error and can no longer continue.
 *
 * The chain is automatically considered as "dead". No {@link ToExtensionRemoveChain} message
 * needs to be sent.
 *
 * This message can happen either before or after a {@link ToApplicationChainReady} concerning
 * this chain has been sent.
 */
export interface ToApplicationError {
  type: "error"
  chainId: string

  /**
   * Human-readable message indicating the problem that happened.
   *
   * Note that, while this message is readable by a human, it is not meant to be displayed to
   * end users. The message itself can be rather cryptic, and is meant for developers to
   * understand the problem that happened.
   */
  errorMessage: string
}

/**
 * Sent in response to a {@link ToExtensionAddChain} or {@link ToExtensionAddWellKnownChain}
 * message. Indicates that the given chain has a valid chain specification or name and is ready
 * to receive JSON-RPC requests.
 *
 * No {@link ToExtensionRpc} message must be sent before this message has been received.
 */
export interface ToApplicationChainReady {
  type: "chain-ready"
  chainId: string
}

/**
 * JSON-RPC response or notification sent by the substrate-connect extension.
 */
export interface ToApplicationRpc {
  type: "rpc"
  chainId: string
  jsonRpcMessage: string
}

/**
 * Messages destined to the extension must conform to this interface.
 */
export type ToExtension = ToExtensionHeader &
  (
    | ToExtensionAddChain
    | ToExtensionAddWellKnownChain
    | ToExtensionRpc
    | ToExtensionRemoveChain
  )

/**
 * Header present in all messages destined to the extension.
 */
export interface ToExtensionHeader {
  /**
   * Messages destined to the extension are sent on the `window`, alongside with potentially
   * other messages that might be completely unrelated to substrate-connect. This `origin` field
   * indicates to the substrate-connect extension that this message is destined to it.
   */
  origin: "substrate-connect-client"
}

/**
 * Ask the extension to add a new connection to the chain with the given specification.
 */
export interface ToExtensionAddChain {
  type: "add-chain"

  /**
   * Identifier for this chain used in all future messages concerning this chain. Allocated by
   * the sender of this message. It is recommended to generate this ID randomly, with at least
   * 48 bits of entropy.
   */
  chainId: string

  /**
   * JSON document containing the specification of the chain.
   *
   * See the Substrate documentation for more information about the fields.
   *
   * Note that this specification is fully trusted. If an attacker can somehow alter this
   * specification, they can redirect the connection to a fake chain controlled by this attacker.
   * In other words, the role of the substrate-connect extension is to connect to the chain whose
   * specification is provided here, but not to have an opinion on whether this specification is
   * legitimate.
   */
  chainSpec: string

  /**
   * List of `chainId`s of all chains that are part of the same trusted sandbox as the provided
   * chain specification.
   *
   * Set this to the list of all chains that are currently alive.
   *
   * If one of the chains isn't known by the extension, it gets silently removed from the array.
   * This is necessary in order to avoid race conditions, as the extension might have sent a
   * {@link ToApplicationError} message at the same time as this message has been sent.
   */
  potentialRelayChainIds: string[]
}

/**
 * Ask the extension to add a new connection to the chain of the given name.
 *
 * The substrate-connect extension comes with some hardcoded chain names that applications can
 * connect to. This list of names isn't indicated here, as it can change over time.
 *
 * Because the extension reserves the right to remove support for a well-known chain in the future,
 * applications should fall back to {@link ToExtensionAddChain} if this well-known chain
 * connection fails.
 */
export interface ToExtensionAddWellKnownChain {
  type: "add-well-known-chain"

  /**
   * Identifier for this chain used in all future messages concerning this chain. Allocated by
   * the sender of this message. It is recommended to generate this ID randomly, with at least
   * 48 bits of entropy.
   */
  chainId: string

  /**
   * Name of the chain to connect to.
   */
  chainName: string
}

/**
 * Send a JSON-RPC request concerning the given chain.
 *
 * Must not be sent before a {@link ToApplicationChainReady} message has been received.
 *
 * If the chain isn't known by the extension, this message is silently discarded. This is
 * necessary in order to avoid race conditions, as the extension might have sent a
 * {@link ToApplicationError} message at the same time as this message has been sent.
 *
 * If the JSON-RPC request is malformed (i.e. not valid JSON, or missing the mandatory field of a
 * request), it is silently ignored. While it wouldn't be a bad idea to provide feedback about this
 * problem, doing so would considerably complicate the problem, which isn't worth the trade-off.
 */
export interface ToExtensionRpc {
  type: "rpc"
  chainId: string
  jsonRpcMessage: string
}

/**
 * Destroy the given chain.
 *
 * Applications are strongly encouraged to send this message when they don't need the given chain
 * anymore.
 *
 * If the chain isn't known by the extension, this message is silently discarded. This is
 * necessary in order to avoid race conditions, as the extension might have sent a
 * {@link ToApplicationError} message at the same time as this message has been sent.
 */
export interface ToExtensionRemoveChain {
  type: "remove-chain"
  chainId: string
}
