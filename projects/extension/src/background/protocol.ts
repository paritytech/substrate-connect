/**
 * This module contains the types that are exchanged between the content script and the
 * extension's background page.
 *
 * All of the `ToExtension` messages *must* be answered in order to avoid some tricky race
 * conditions (note: in reality only some of them need to be answered, but it's been decided
 * that all of them should, for consistency). If not specified, they are answered with `null`.
 *
 * **IMPORTANT**: Each `ToExtension` message must only be sent after the previously sent message
 * has received a response. Again, this avoids tricky race conditions.
 */

export type ToExtension =
  | ToExtensionGetWellKnownChain
  | ToExtensionDatabaseContent
  | ToExtensionReset
  | ToExtensionAddChain
  | ToExtensionChainInfoUpdate
  | ToExtensionRemoveChain

// Must be answered with a {ToContentScriptWellKnownChain}.
export interface ToExtensionGetWellKnownChain {
  type: "get-well-known-chain"
  chainName: string
}

// The content script uploads the database content of the given well-known chain.
export interface ToExtensionDatabaseContent {
  type: "database-content"
  chainName: string
  databaseContent: string
}

// Report to the extension that all the chains of the current tab have been destroyed.
// This is sent when the content script is loaded in order to indicate that the previous content
// script of the same tab no longer exists.
export interface ToExtensionReset {
  type: "tab-reset"
}

// Report to the extension that a new chain has been initialized.
// Note that the `chainId` is entirely scoped to the content-script <-> extension interface. It
// does not (necessarily) relate to the `chainId` used in the connect-extension-protocol.
export interface ToExtensionAddChain {
  type: "add-chain"
  chainId: string
  isWellKnown: boolean
  chainSpecChainName: string
}

// Report to the extension an update of the properties of the given chain.
export interface ToExtensionChainInfoUpdate {
  type: "chain-info-update"
  chainId: string
  peers: number
  bestBlockNumber?: number
}

// Report to the extension that a chain previously added with {ToExtensionAddChain} has been
// removed.
export interface ToExtensionRemoveChain {
  type: "remove-chain"
  chainId: string
}

export type ToContentScript = ToContentScriptWellKnownChain | null

// Response to a {ToExtensionGetWellKnownChain}
export interface ToContentScriptWellKnownChain {
  type: "get-well-known-chain"
  found?: {
    chainSpec: string
    databaseContent: string
  }
}
