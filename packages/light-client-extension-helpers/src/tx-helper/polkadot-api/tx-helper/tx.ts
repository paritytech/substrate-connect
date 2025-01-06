import type { BlockInfo, ChainHead$ } from "@polkadot-api/observable-client"
import type { PolkadotSigner } from "@polkadot-api/polkadot-signer"
import { getPolkadotSigner } from "@polkadot-api/signer"
import {
  AccountId,
  Binary,
  type Decoder,
  Enum,
  u32,
} from "@polkadot-api/substrate-bindings"
import { fromHex, mergeUint8, toHex } from "@polkadot-api/utils"
import {
  Observable,
  combineLatest,
  firstValueFrom,
  map,
  mergeMap,
  take,
  throwError,
} from "rxjs"
import type { PlainDescriptor } from "./descriptors.js"
import {
  type CompatibilityHelper,
  CompatibilityToken,
  getCompatibilityApi,
  RuntimeToken,
} from "./compatibility.js"
import { createTx } from "./create-tx.js"
import { InvalidTxError, submit, submit$ } from "./submit-fns.js"
import type {
  PaymentInfo,
  TxCall,
  TxEntry,
  TxObservable,
  TxOptions,
  TxPromise,
  TxSignFn,
} from "./types.js"
import {
  isCompatible,
  mapLookupToTypedef,
} from "@polkadot-api/metadata-compatibility"

export { submit, submit$, InvalidTxError }

const accountIdEnc = AccountId().enc
const fakeSignature = new Uint8Array(64)
const fakeSignatureEth = new Uint8Array(65)
const getFakeSignature = (isEth: boolean) => () =>
  isEth ? fakeSignatureEth : fakeSignature

export const createTxEntry = <
  D,
  Arg extends {} | undefined,
  Pallet extends string,
  Name extends string,
  Asset extends PlainDescriptor<any>,
>(
  pallet: Pallet,
  name: Name,
  chainHead: ChainHead$,
  broadcast: (tx: string) => Observable<never>,
  {
    isCompatible: isCompatibleHelper,
    getCompatibilityLevel,
    compatibleRuntime$,
    argsAreCompatible,
    getRuntimeTypedef,
  }: CompatibilityHelper,
  checkCompatibility: boolean,
): TxEntry<D, Arg, Pallet, Name, Asset> => {
  const fn = (arg?: Arg): any => {
    const getCallDataWithContext = (
      runtime: CompatibilityToken | RuntimeToken,
      arg: any,
      txOptions: Partial<{ asset: any }> = {},
    ) => {
      const ctx = getCompatibilityApi(runtime).runtime()
      const { dynamicBuilder, assetId, lookup } = ctx
      let codecs
      try {
        codecs = dynamicBuilder.buildCall(pallet, name)
      } catch {
        throw new Error(`Runtime entry Tx(${pallet}.${name}) not found`)
      }
      if (checkCompatibility && !argsAreCompatible(runtime, ctx, arg))
        throw new Error(`Incompatible runtime entry Tx(${pallet}.${name})`)

      let returnOptions = txOptions
      if (txOptions.asset) {
        if (
          assetId == null ||
          !isCompatible(
            txOptions.asset,
            mapLookupToTypedef(lookup(assetId)),
            (id) => getRuntimeTypedef(ctx, id),
          )
        )
          throw new Error(`Incompatible runtime asset`)
        returnOptions = {
          ...txOptions,
          asset: dynamicBuilder.buildDefinition(assetId).enc(txOptions.asset),
        }
      }

      const { location, codec } = codecs
      return {
        callData: Binary.fromBytes(
          mergeUint8(new Uint8Array(location), codec.enc(arg)),
        ),
        options: returnOptions,
      }
    }

    const getCallData$ = (arg: any, options: Partial<{ asset: any }> = {}) =>
      compatibleRuntime$(chainHead, null).pipe(
        map(([runtime]) => getCallDataWithContext(runtime, arg, options)),
      )

    const getEncodedData: TxCall = (
      token?: CompatibilityToken | RuntimeToken,
    ): any => {
      if (!token)
        return firstValueFrom(getCallData$(arg).pipe(map((x) => x.callData)))

      return getCallDataWithContext(token, arg).callData
    }

    const sign$ = (
      from: PolkadotSigner,
      { ..._options }: Omit<TxOptions<{}>, "at">,
      atBlock: BlockInfo,
    ) =>
      getCallData$(arg, _options).pipe(
        mergeMap(({ callData, options }) =>
          createTx(
            chainHead,
            from,
            callData.asBytes(),
            atBlock,
            _options.customSignedExtensions || {},
            options,
          ),
        ),
      )

    const _sign = (
      from: PolkadotSigner,
      { at, ..._options }: TxOptions<{}> = {},
    ) => {
      return (
        !at || at === "finalized"
          ? chainHead.finalized$
          : at === "best"
            ? chainHead.best$
            : chainHead.bestBlocks$.pipe(
                map((x) => x.find((b) => b.hash === at)),
              )
      ).pipe(
        take(1),
        mergeMap((atBlock) =>
          atBlock
            ? sign$(from, _options, atBlock).pipe(
                map((signed) => ({
                  tx: toHex(signed),
                  block: atBlock,
                })),
              )
            : throwError(() => new Error(`Uknown block ${at}`)),
        ),
      )
    }

    const sign: TxSignFn<Asset> = (from, options) =>
      firstValueFrom(_sign(from, options)).then((x) => x.tx)

    const signAndSubmit: TxPromise<Asset> = (from, _options) =>
      firstValueFrom(_sign(from, _options)).then(({ tx, block }) =>
        submit(chainHead, broadcast, tx, block.hash),
      )

    const signSubmitAndWatch: TxObservable<Asset> = (from, _options) =>
      _sign(from, _options).pipe(
        mergeMap(({ tx, block }) =>
          submit$(chainHead, broadcast, tx, block.hash, true),
        ),
      )

    const getPaymentInfo = async (
      from: Uint8Array | string,
      _options?: any,
    ) => {
      if (typeof from === "string")
        from = from.startsWith("0x") ? fromHex(from) : accountIdEnc(from)
      const isEth = from.length === 20
      const fakeSigner = getPolkadotSigner(
        from,
        isEth ? "Ecdsa" : "Sr25519",
        getFakeSignature(isEth),
      )
      const encoded = fromHex(await sign(fakeSigner, _options))
      const args = toHex(mergeUint8(encoded, u32.enc(encoded.length)))

      const decoder$: Observable<Decoder<PaymentInfo>> = chainHead
        .getRuntimeContext$(null)
        .pipe(
          map((ctx) => {
            return ctx.dynamicBuilder.buildRuntimeCall(
              "TransactionPaymentApi",
              "query_info",
            ).value[1]
          }),
        )

      const call$ = chainHead.call$(
        null,
        "TransactionPaymentApi_query_info",
        args,
      )

      return firstValueFrom(
        combineLatest([call$, decoder$]).pipe(
          map(([result, decoder]) => decoder(result)),
        ),
      )
    }

    const getEstimatedFees = async (
      from: Uint8Array | string,
      _options?: any,
    ) => (await getPaymentInfo(from, _options)).partial_fee

    return {
      getPaymentInfo,
      getEstimatedFees,
      decodedCall: {
        type: pallet,
        value: Enum(name, arg as any),
      },
      getEncodedData,
      sign,
      signSubmitAndWatch,
      signAndSubmit,
    }
  }

  return Object.assign(fn, {
    getCompatibilityLevel,
    isCompatible: isCompatibleHelper,
  })
}
