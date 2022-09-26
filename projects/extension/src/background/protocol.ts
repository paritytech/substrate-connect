/**
 * This module contains the types that are exchanged between the content script and the
 * extension's background page.
 */

export type ToExtension = ToExtensionGetWellKnownChain

export interface ToExtensionGetWellKnownChain {
  type: 'get-well-known-chain',
  chainName: string,
}

export type ToContentScript = ToContentScriptWellKnownChain

export interface ToContentScriptWellKnownChain {
  type: 'get-well-known-chain',
  chainName: string,
  chainSpec: string,
  databaseContent: string,
}
