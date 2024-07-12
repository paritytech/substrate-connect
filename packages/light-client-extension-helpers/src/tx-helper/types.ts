import type { JsonRpcProvider } from "@polkadot-api/json-rpc-provider"
import type { PolkadotSigner } from "@polkadot-api/polkadot-signer"

export type HintedSignedExtensions = Partial<{
  readonly tip: bigint
  readonly mortality: { mortal: false } | { mortal: true; period: number }
  readonly asset: Uint8Array
  readonly nonce: number
}>

export type CreateTxOptions = {
  readonly signer: PolkadotSigner
  readonly callData: Uint8Array
  readonly hinted?: HintedSignedExtensions
}

export type { JsonRpcProvider, PolkadotSigner }
