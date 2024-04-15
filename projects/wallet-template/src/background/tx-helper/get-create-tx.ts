import { Observable, combineLatest, mergeMap, of, take } from "rxjs"
import { BlockInfo, ChainHead$ } from "@polkadot-api/observable-client"
import { HintedSignedExtensions } from "./types"
import {
  ChargeAssetTxPayment,
  ChargeTransactionPayment,
  CheckMortality,
} from "./signed-extensions/user"
import * as chainSignedExtensions from "./signed-extensions/chain"
import type { PolkadotSigner } from "@polkadot-api/polkadot-signer"
import { _void } from "@polkadot-api/substrate-bindings"
import { empty } from "./signed-extensions/utils"

export const getCreateTx = (
  chainHead: ChainHead$,
): ((
  signer: PolkadotSigner,
  callData: Uint8Array,
  atBlock: BlockInfo,
  hinted?: HintedSignedExtensions,
) => Observable<Uint8Array>) => {
  return (signer, callData, atBlock, hinted) => {
    return chainHead.getRuntimeContext$(atBlock.hash).pipe(
      take(1),
      mergeMap((ctx) => {
        const signedExtensionsCtx = {
          metadata: ctx.metadata,
          chainHead: chainHead,
          callData: callData,
          at: atBlock.hash,
          from: signer.publicKey,
        }

        const mortality = hinted?.mortality?.mortal
          ? { period: hinted.mortality.period, blockNumber: atBlock.number }
          : undefined

        return combineLatest(
          ctx.metadata.extrinsic.signedExtensions.map(
            ({ identifier, type, additionalSigned }) => {
              if (identifier === "CheckMortality")
                return CheckMortality(mortality, signedExtensionsCtx)

              if (identifier === "ChargeTransactionPayment")
                return ChargeTransactionPayment(hinted?.tip ?? 0n)

              if (identifier === "ChargeAssetTxPayment")
                return ChargeAssetTxPayment(hinted?.tip ?? 0n, hinted?.asset)

              const fn = chainSignedExtensions[identifier as "CheckGenesis"]
              if (!fn) {
                if (
                  ctx.dynamicBuilder.buildDefinition(type) === _void &&
                  ctx.dynamicBuilder.buildDefinition(additionalSigned) === _void
                )
                  return of({
                    value: empty,
                    additionalSigned: empty,
                  })

                throw new Error(`Unsupported signed-extension: ${identifier}`)
              }
              return fn(signedExtensionsCtx)
            },
          ),
        ).pipe(
          mergeMap((signedExtensions) =>
            signer.sign(
              callData,
              Object.fromEntries(
                ctx.metadata.extrinsic.signedExtensions.map(
                  ({ identifier }, idx) => [
                    identifier,
                    { identifier, ...signedExtensions[idx] },
                  ],
                ),
              ),
              ctx.metadataRaw,
              atBlock.number,
            ),
          ),
        )
      }),
    )
  }
}
