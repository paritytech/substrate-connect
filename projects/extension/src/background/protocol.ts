/**
 * This module contains the types that are exchanged between the content script and the
 * extension's background page.
 */

export type ToExtension = ToExtensionGetWellKnownChain | ToExtensionDatabaseContent |
  ToExtensionAddChain | ToExtensionChainInfoUpdate | ToExtensionRemoveChain

// Must be answered with a {ToContentScriptWellKnownChain}.
export interface ToExtensionGetWellKnownChain {
  type: 'get-well-known-chain',
  chainName: string,
}

// The content script uploads the database content of the given well-known chain.
export interface ToExtensionDatabaseContent {
  type: 'database-content',
  chainName: string,
  databaseContent: string,
}

// Report to the extension that a new chain has been initialized.
// Note that the `chainId` is entirely scoped to the content-script <-> extension interface. It
// does not (necessarily) relate to the `chainId` used in the connect-extension-protocol.
export interface ToExtensionAddChain {
  type: 'add-chain',
  chainId: string,
  chainSpecChainName: string,
}

// Report to the extension an update of the properties of the given chain.
export interface ToExtensionChainInfoUpdate {
  type: 'chain-info-update',
  chainId: string,
  peers: number,
  bestBlockNumber: number,
}

// Report to the extension that a chain previously added with {ToExtensionAddChain} has been
// removed.
export interface ToExtensionRemoveChain {
  type: 'remove-chain',
  chainId: string,
}

export type ToContentScript = ToContentScriptWellKnownChain

// Response to a {ToExtensionGetWellKnownChain}
export interface ToContentScriptWellKnownChain {
  type: 'get-well-known-chain',
  chainName: string,
  found?: {
    chainSpec: string,
    databaseContent: string,
  }
}
