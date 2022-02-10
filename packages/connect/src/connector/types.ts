import { WellKnownChains } from "../WellKnownChains.js"

export interface Chain {
  sendJsonRpc(rpc: string): void
  remove(): void
}

export type JsonRpcCallback = (response: string) => void

export type AddChain = (
  chainSpec: string,
  jsonRpcCallback?: JsonRpcCallback,
) => Promise<Chain>

export type AddWellKnownChain = (
  name: WellKnownChains,
  jsonRpcCallback?: JsonRpcCallback,
) => Promise<Chain>

export interface SubstrateConnector {
  addChain: AddChain
  addWellKnownChain: AddWellKnownChain
}
