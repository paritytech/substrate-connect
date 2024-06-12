import { IsCompatible, Runtime } from "@/runtime"
import { SystemEvent } from "@polkadot-api/observable-client"
import { PolkadotSigner } from "@polkadot-api/polkadot-signer"
import {
  Binary,
  Enum,
  HexString,
  SS58String,
} from "@polkadot-api/substrate-bindings"
import { Observable } from "rxjs"

export type TxEvent = TxSigned | TxBroadcasted | TxBestBlocksState | TxFinalized
export type TxBroadcastEvent =
  | TxSigned
  | TxBroadcasted
  | TxBestBlocksState
  | TxFinalized

export type TxSigned = { type: "signed"; txHash: HexString }

export type TxBroadcasted = { type: "broadcasted"; txHash: HexString }

export type TxBestBlocksState = {
  type: "txBestBlocksState"
  txHash: HexString
} & (TxInBestBlocksNotFound | TxInBestBlocksFound)

export type TxInBestBlocksNotFound = {
  found: false
  isValid: boolean
}

export type TxInBestBlocksFound = {
  found: true
} & TxEventsPayload

export type TxEventsPayload = {
  ok: boolean
  events: Array<SystemEvent["event"]>
  block: { hash: string; index: number }
}

export type TxFinalized = {
  type: "finalized"
  txHash: HexString
} & TxEventsPayload

export type TxOptions<Asset> = Partial<
  void extends Asset
    ? {
        at: HexString | "best" | "finalized"
        tip: bigint
        mortality: { mortal: false } | { mortal: true; period: number }
        nonce: number
      }
    : {
        at: HexString | "best" | "finalized"
        tip: bigint
        mortality: { mortal: false } | { mortal: true; period: number }
        asset: Asset
        nonce: number
      }
>

export type TxFinalizedPayload = Omit<TxFinalized, "type">
export type TxPromise<Asset> = (
  from: PolkadotSigner,
  txOptions?: TxOptions<Asset>,
) => Promise<TxFinalizedPayload>

export type TxObservable<Asset> = (
  from: PolkadotSigner,
  txOptions?: TxOptions<Asset>,
) => Observable<TxEvent>

export interface TxCall {
  (): Promise<Binary>
  (runtime: Runtime): Binary
}

export type TxSignFn<Asset> = (
  from: PolkadotSigner,
  txOptions?: TxOptions<Asset>,
) => Promise<HexString>

export type Transaction<
  Arg extends {} | undefined,
  Pallet extends string,
  Name extends string,
  Asset,
> = {
  sign: TxSignFn<Asset>
  signSubmitAndWatch: TxObservable<Asset>
  signAndSubmit: TxPromise<Asset>
  getEncodedData: TxCall
  getEstimatedFees: (
    from: Uint8Array | SS58String,
    txOptions?: TxOptions<Asset>,
  ) => Promise<bigint>
  decodedCall: Enum<{ [P in Pallet]: Enum<{ [N in Name]: Arg }> }>
}

export interface TxEntry<
  Arg extends {} | undefined,
  Pallet extends string,
  Name extends string,
  Asset,
> {
  (
    ...args: Arg extends undefined ? [] : [data: Arg]
  ): Transaction<Arg, Pallet, Name, Asset>
  isCompatible: IsCompatible
}
