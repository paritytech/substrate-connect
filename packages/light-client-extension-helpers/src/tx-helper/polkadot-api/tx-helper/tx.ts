import {
  AccountId,
  Binary,
  Enum,
  SS58String,
  Tuple,
  compact,
  u128,
  u32,
  u8,
} from "@polkadot-api/substrate-bindings"
import { fromHex, mergeUint8, toHex } from "@polkadot-api/utils"
import {
  Observable,
  firstValueFrom,
  map,
  mergeMap,
  take,
  throwError,
} from "rxjs"
import {
  BlockInfo,
  RuntimeContext,
  getObservableClient,
} from "@polkadot-api/observable-client"
import type { CompatibilityHelper, Runtime } from "./runtime"
import { PolkadotSigner } from "@polkadot-api/polkadot-signer"
import { getPolkadotSigner } from "@polkadot-api/signer"
import type { AssetDescriptor } from "./descriptors"
import { createTx } from "./create-tx"
import {
  TxCall,
  TxEntry,
  TxPromise,
  TxObservable,
  TxOptions,
  TxSignFn,
} from "./types"
import { submit, submit$ } from "./submit-fns"

export { submit, submit$ }

const accountIdEnc = AccountId().enc
const queryInfoRawDec = Tuple(compact, compact, u8, u128).dec
const queryInfoDec = (input: string): bigint => queryInfoRawDec(input)[3]
const fakeSignature = new Uint8Array(64)
const getFakeSignature = () => fakeSignature

export const createTxEntry = <
  Arg extends {} | undefined,
  Pallet extends string,
  Name extends string,
  Asset extends AssetDescriptor<any>,
>(
  pallet: Pallet,
  name: Name,
  assetChecksum: Asset,
  chainHead: ReturnType<ReturnType<typeof getObservableClient>["chainHead$"]>,
  broadcast: (tx: string) => Observable<never>,
  compatibilityHelper: CompatibilityHelper,
): TxEntry<Arg, Pallet, Name, Asset["_type"]> => {
  const { isCompatible, compatibleRuntime$ } = compatibilityHelper((ctx) =>
    ctx.checksumBuilder.buildCall(pallet, name),
  )
  const checksumError = () =>
    new Error(`Incompatible runtime entry Tx(${pallet}.${name})`)

  const fn = (arg?: Arg): any => {
    const getCallDataWithContext = (
      { dynamicBuilder, asset: [assetEnc, assetCheck] }: RuntimeContext,
      arg: any,
      txOptions: Partial<{ asset: any }> = {},
    ) => {
      let returnOptions = txOptions
      if (txOptions.asset) {
        if (assetChecksum !== assetCheck)
          throw new Error(`Incompatible runtime asset`)
        returnOptions = { ...txOptions, asset: assetEnc(txOptions.asset) }
      }

      const { location, codec } = dynamicBuilder.buildCall(pallet, name)
      return {
        callData: Binary.fromBytes(
          mergeUint8(new Uint8Array(location), codec.enc(arg)),
        ),
        options: returnOptions,
      }
    }

    const getCallData$ = (arg: any, options: Partial<{ asset: any }> = {}) =>
      compatibleRuntime$(chainHead, null, checksumError).pipe(
        map((ctx) => getCallDataWithContext(ctx, arg, options)),
      )

    const getEncodedData: TxCall = (runtime?: Runtime): any => {
      if (!runtime)
        return firstValueFrom(getCallData$(arg).pipe(map((x) => x.callData)))

      if (!isCompatible(runtime)) throw checksumError()
      return getCallDataWithContext(runtime._getCtx(), arg).callData
    }

    const sign$ = (
      from: PolkadotSigner,
      { ..._options }: Omit<TxOptions<{}>, "at">,
      atBlock: BlockInfo,
    ) =>
      getCallData$(arg, _options).pipe(
        mergeMap(({ callData, options }) =>
          createTx(chainHead, from, callData.asBytes(), atBlock, options),
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

    const getEstimatedFees = async (
      from: Uint8Array | SS58String,
      _options?: any,
    ) => {
      const fakeSigner = getPolkadotSigner(
        from instanceof Uint8Array ? from : accountIdEnc(from),
        "Sr25519",
        getFakeSignature,
      )
      const encoded = fromHex(await sign(fakeSigner, _options))
      const args = toHex(mergeUint8(encoded, u32.enc(encoded.length)))

      return firstValueFrom(
        chainHead
          .call$(null, "TransactionPaymentApi_query_info", args)
          .pipe(map(queryInfoDec)),
      )
    }

    return {
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

  return Object.assign(fn, { isCompatible })
}
