import {
  type CompatibilityFunctions,
  CompatibilityToken,
  RuntimeToken,
} from "./compatibility.js"
import type { SystemEvent } from "@polkadot-api/observable-client"
import type { PolkadotSigner } from "@polkadot-api/polkadot-signer"
import {
  Binary,
  Enum,
  type HexString,
  type SS58String,
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

export type EventWithTopics = SystemEvent["event"] & {
  topics: SystemEvent["topics"]
}
export type TxEventsPayload = {
  /**
   * Verify if extrinsic was successful, i.e. check if `System.ExtrinsicSuccess`
   * is found.
   */
  ok: boolean
  /**
   * Array of all events emitted by the tx. Ordered as they are emitted
   * on-chain.
   */
  events: Array<EventWithTopics>
  /**
   * Block information where the tx is found. `hash` of the block, `number` of
   * the block, `index` of the tx in the block.
   */
  block: { hash: string; number: number; index: number }
} & (
  | {
      ok: true
      /**
       * Dispatch Error found at `System.ExtrinsicFailed` event.
       */
      dispatchError?: undefined
    }
  | {
      ok: false
      /**
       * Dispatch Error found at `System.ExtrinsicFailed` event.
       */
      dispatchError: {
        type: string
        value: unknown
      }
    }
)

export type TxFinalized = {
  type: "finalized"
  txHash: HexString
} & TxEventsPayload
export type TxFinalizedPayload = { txHash: HexString } & TxEventsPayload

export type CustomSignedExtensionValues =
  | {
      value: any
      additionalSigned: any
    }
  | {
      value: any
    }
  | {
      additionalSigned: any
    }

export type TxOptions<Asset> = Partial<
  void extends Asset
    ? {
        /**
         * Block to target the transaction against. Default: `"finalized"`
         */
        at: HexString | "best" | "finalized"
        /**
         * Tip in fundamental units. Default: `0`
         */
        tip: bigint
        /**
         * Mortality of the transaction. Default: `{ mortal: true, period: 64 }`
         */
        mortality: { mortal: false } | { mortal: true; period: number }
        /**
         * Custom nonce for the transaction. Default: retrieve from latest known
         * finalized block.
         */
        nonce: number
        /**
         * Custom values for chains that have custom signed-extensions.
         * The key of the Object should be the signed-extension name and the
         * value is an Object that accepts 2 possible keys: one for `value`
         * and the other one for `additionallySigned`. They both receive either
         * the encoded value as a `Uint8Array` that should be used for the
         * signed-extension, or the decoded value that PAPI will encode using
         * its dynamic codecs. At least one of the 2 values must be included
         * into the signed-extension Object.
         */
        customSignedExtensions: Record<string, CustomSignedExtensionValues>
      }
    : {
        /**
         * Block to target the transaction against. Default: `"finalized"`
         */
        at: HexString | "best" | "finalized"
        /**
         * Tip in fundamental units. Default: `0`
         */
        tip: bigint
        /**
         * Mortality of the transaction. Default: `{ mortal: true, period: 64 }`
         */
        mortality: { mortal: false } | { mortal: true; period: number }
        /**
         * Asset information to pay fees, tip, etc. By default it'll use the
         * native token of the chain.
         */
        asset: Asset
        /**
         * Custom nonce for the transaction. Default: retrieve from latest known
         * finalized block.
         */
        nonce: number
        /**
         * Custom values for chains that have custom signed-extensions.
         * The key of the Object should be the signed-extension name and the
         * value is an Object that accepts 2 possible keys: one for `value`
         * and the other one for `additionallySigned`. They both receive either
         * the encoded value as a `Uint8Array` that should be used for the
         * signed-extension, or the decoded value that PAPI will encode using
         * its dynamic codecs. At least one of the 2 values must be included
         * into the signed-extension Object.
         */
        customSignedExtensions: Record<string, CustomSignedExtensionValues>
      }
>

export type TxPromise<Asset> = (
  from: PolkadotSigner,
  txOptions?: TxOptions<Asset>,
) => Promise<TxFinalizedPayload>

export type TxObservable<Asset> = (
  from: PolkadotSigner,
  txOptions?: TxOptions<Asset>,
) => Observable<TxEvent>

export interface TxCall {
  /**
   * SCALE-encoded callData of the transaction.
   *
   * @returns Promise resolving in the encoded data.
   */
  (): Promise<Binary>
  /**
   * SCALE-encoded callData of the transaction.
   *
   * @param compatibilityToken  Token from got with `await
   *                            typedApi.compatibilityToken`
   * @returns Synchronously returns encoded data.
   */
  (compatibilityToken: CompatibilityToken): Binary
}

export interface UnsafeTxCall {
  /**
   * SCALE-encoded callData of the transaction.
   *
   * @returns Promise resolving in the encoded data.
   */
  (): Promise<Binary>
  /**
   * SCALE-encoded callData of the transaction.
   *
   * @param runtimeToken  Token from got with `await typedApi.runtimeToken`
   * @returns Synchronously returns encoded data.
   */
  (runtimeToken: RuntimeToken): Binary
}

export type TxSignFn<Asset> = (
  from: PolkadotSigner,
  txOptions?: TxOptions<Asset>,
) => Promise<HexString>

export type PaymentInfo = {
  weight: {
    ref_time: bigint
    proof_size: bigint
  }
  class: Enum<{
    Normal: undefined
    Operational: undefined
    Mandatory: undefined
  }>
  partial_fee: bigint
}

export type InnerTransaction<
  Unsafe,
  Arg extends {} | undefined,
  Pallet extends string,
  Name extends string,
  Asset,
> = {
  /**
   * Pack the transaction, sends it to the signer, and return the signature
   * asynchronously. If the signer fails (or the user cancels the signature)
   * it'll throw an error.
   *
   * @param from       `PolkadotSigner`-compliant signer.
   * @param txOptions  Optionally pass any number of txOptions.
   * @returns Encoded `SignedExtrinsic` ready for broadcasting.
   */
  sign: TxSignFn<Asset>
  /**
   * Observable-based all-in-one transaction submitting. It will sign,
   * broadcast, and track the transaction. The observable is singlecast, i.e.
   * it will sign, broadcast, etc at every subscription. It will complete once
   * the transaction is found in a `finalizedBlock`.
   *
   * @param from       `PolkadotSigner`-compliant signer.
   * @param txOptions  Optionally pass any number of txOptions.
   * @returns Observable to the transaction.
   */
  signSubmitAndWatch: TxObservable<Asset>
  /**
   * Pack the transaction, sends it to the signer, broadcast, and track the
   * transaction. The promise will resolve as soon as the transaction in found
   * in a `finalizedBlock`. If the signer fails (or the user cancels the
   * signature), or the transaction becomes invalid it'll throw an error.
   *
   * @param from       `PolkadotSigner`-compliant signer.
   * @param txOptions  Optionally pass any number of txOptions.
   * @returns Finalized transaction information.
   */
  signAndSubmit: TxPromise<Asset>
  /**
   * SCALE-encoded callData of the transaction.
   */
  getEncodedData: Unsafe extends true ? UnsafeTxCall : TxCall
  /**
   * Estimate fees against the latest known `finalizedBlock`
   *
   * @param from       Public key or address from the potential sender.
   * @param txOptions  Optionally pass any number of txOptions.
   * @returns Fees in fundamental units.
   */
  getEstimatedFees: (
    from: Uint8Array | SS58String,
    txOptions?: TxOptions<Asset>,
  ) => Promise<bigint>
  /**
   * Payment info against the latest known `finalizedBlock`
   *
   * @param from       Public key or address from the potential sender.
   * @param txOptions  Optionally pass any number of txOptions.
   * @returns PaymentInfo for the given transaction (weight, estimated fees
   *          and class).
   */
  getPaymentInfo: (
    from: Uint8Array | SS58String,
    txOptions?: TxOptions<Asset>,
  ) => Promise<PaymentInfo>

  /**
   * PAPI way of expressing an extrinsic with arguments.
   * It's useful to pass as a parameter to extrinsics that accept calls.
   */
  decodedCall: Enum<{ [P in Pallet]: Enum<{ [N in Name]: Arg }> }>
}

export type Transaction<
  Arg extends {} | undefined,
  Pallet extends string,
  Name extends string,
  Asset,
> = InnerTransaction<false, Arg, Pallet, Name, Asset>

export type UnsafeTransaction<
  Arg extends {} | undefined,
  Pallet extends string,
  Name extends string,
  Asset,
> = InnerTransaction<true, Arg, Pallet, Name, Asset>

export type InnerTxEntry<
  Unsafe,
  D,
  Arg extends {} | undefined,
  Pallet extends string,
  Name extends string,
  Asset,
> = Unsafe extends true
  ? {
      /**
       * Synchronously create the transaction object ready to sign, submit,
       * estimate fees, etc.
       *
       * @param args  All parameters required by the transaction.
       * @returns Transaction object.
       */
      (
        ...args: Arg extends undefined ? [] : [data: Arg]
      ): UnsafeTransaction<Arg, Pallet, Name, Asset>
    }
  : {
      /**
       * Synchronously create the transaction object ready to sign, submit,
       * estimate fees, etc.
       *
       * @param args  All parameters required by the transaction.
       * @returns Transaction object.
       */
      (
        ...args: Arg extends undefined ? [] : [data: Arg]
      ): Transaction<Arg, Pallet, Name, Asset>
    } & CompatibilityFunctions<D>

export type TxEntry<
  D,
  Arg extends {} | undefined,
  Pallet extends string,
  Name extends string,
  Asset,
> = InnerTxEntry<false, D, Arg, Pallet, Name, Asset>

export type UnsafeTxEntry<
  D,
  Arg extends {} | undefined,
  Pallet extends string,
  Name extends string,
  Asset,
> = InnerTxEntry<true, D, Arg, Pallet, Name, Asset>

export type TxFromBinary<Unsafe, Asset> = Unsafe extends true
  ? {
      /**
       * Asynchronously create the transaction object from a binary call data
       * ready to sign, submit, estimate fees, etc.
       *
       * @param callData  SCALE-encoded call data.
       * @returns Transaction object.
       */
      (callData: Binary): Promise<UnsafeTransaction<any, string, string, Asset>>
      /**
       * Synchronously create the transaction object from a binary call data
       * ready to sign, submit, estimate fees, etc.
       *
       * @param callData      SCALE-encoded call data.
       * @param runtimeToken  Token from got with `await
       *                      typedApi.runtimeToken`
       * @returns Transaction object.
       */
      (
        callData: Binary,
        runtimeToken: RuntimeToken,
      ): UnsafeTransaction<any, string, string, Asset>
    }
  : {
      /**
       * Asynchronously create the transaction object from a binary call data
       * ready to sign, submit, estimate fees, etc.
       *
       * @param callData  SCALE-encoded call data.
       * @returns Transaction object.
       */
      (callData: Binary): Promise<Transaction<any, string, string, Asset>>
      /**
       * Synchronously create the transaction object from a binary call data
       * ready to sign, submit, estimate fees, etc.
       *
       * @param callData            SCALE-encoded call data.
       * @param compatibilityToken  Token from got with `await
       *                            typedApi.compatibilityToken`
       * @returns Transaction object.
       */
      (
        callData: Binary,
        compatibilityToken: CompatibilityToken,
      ): Transaction<any, string, string, Asset>
    }

export type FixedSizeArray<L extends number, T> = Array<T> & { length: L }
