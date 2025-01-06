import { getObservableClient } from "@polkadot-api/observable-client"
import { createClient } from "@polkadot-api/substrate-client"
import type { CreateTxOptions, JsonRpcProvider } from "./types.js"
import { filter, firstValueFrom, map, mergeMap, take } from "rxjs"
import * as polkadotAPI from "./polkadot-api/index.js"

type UserSignedExtensions = {
  CheckMortality?:
    | {
        mortal: false
      }
    | {
        mortal: true
        period: number
      }
  ChargeTransactionPayment: bigint
  ChargeAssetTxPayment: {
    tip: bigint
    asset?: Uint8Array
  }
}

type UserSignedExtensionName = keyof UserSignedExtensions

const isUserSignedExtensionName = (s: string): s is UserSignedExtensionName => {
  return (
    s === "CheckMortality" ||
    s === "ChargeTransactionPayment" ||
    s === "ChargeAssetTxPayment"
  )
}

export const createTx =
  (jsonRpcProvider: JsonRpcProvider) =>
  async (options: CreateTxOptions): Promise<Uint8Array> => {
    const client = getObservableClient(createClient(jsonRpcProvider))
    const chainHead$ = client.chainHead$()

    const { best: atBlock } = await firstValueFrom(
      chainHead$.best$.pipe(
        mergeMap((blockInfo) =>
          chainHead$.getRuntimeContext$(blockInfo.hash).pipe(
            take(1),
            map(({ lookup: { metadata } }) =>
              metadata.extrinsic.signedExtensions
                .map(({ identifier }) => identifier)
                .filter(isUserSignedExtensionName),
            ),
            map((userSignedExtensionNames) => ({
              best: blockInfo,
              userSignedExtensionNames,
            })),
          ),
        ),
        filter(Boolean),
      ),
    )

    const tx = await firstValueFrom(
      polkadotAPI
        .createTx(
          chainHead$,
          options.signer,
          options.callData,
          atBlock,
          {},
          options.hinted,
        )
        .pipe(filter(Boolean)),
    )

    client.destroy()

    return tx
  }

export type * from "./types.js"
