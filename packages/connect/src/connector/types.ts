import { SupportedChains } from "../SupportedChains.js"

export interface Chain {
  sendJsonRpc(rpc: string): void
  remove(): void
}

export type JsonRpcCallback = (response: string) => void

export type AddChain = (
  chainSpec: string,
  jsonRpcCallback?: JsonRpcCallback,
  potentialRelayChains?: Array<Chain>,
) => Promise<Chain>

export type AddWellKnownChain = (
  name: SupportedChains,
  jsonRpcCallback?: JsonRpcCallback,
) => Promise<Chain>

export interface SubstrateConnector {
  addChain: AddChain
  addWellKnownChain: AddWellKnownChain
}
