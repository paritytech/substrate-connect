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
  name: string,
  jsonRpcCallback?: JsonRpcCallback,
) => Promise<Chain>

export interface SmoldotConnect {
  addChain: AddChain
  addWellKnownChain: AddWellKnownChain
}
