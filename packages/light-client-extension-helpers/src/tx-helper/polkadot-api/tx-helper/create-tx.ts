import { Observable, combineLatest, mergeMap, of, take } from "rxjs"
import { BlockInfo, ChainHead$ } from "@polkadot-api/observable-client"
import {
  ChargeAssetTxPayment,
  ChargeTransactionPayment,
  CheckMortality,
} from "./signed-extensions/user"
import * as chainSignedExtensions from "./signed-extensions/chain"
import type { PolkadotSigner } from "@polkadot-api/polkadot-signer"
import { _void } from "@polkadot-api/substrate-bindings"
import { empty } from "./signed-extensions/utils"

type HintedSignedExtensions = Partial<{
  tip: bigint
  mortality: { mortal: false } | { mortal: true; period: number }
  asset: Uint8Array
  nonce: number
}>

export const createTx: (
  chainHead: ChainHead$,
  signer: PolkadotSigner,
  callData: Uint8Array,
  atBlock: BlockInfo,
  hinted?: HintedSignedExtensions,
) => Observable<Uint8Array> = (
  chainHead,
  signer,
  callData,
  atBlock,
  hinted = {},
) =>
  chainHead.getRuntimeContext$(atBlock.hash).pipe(
    take(1),
    mergeMap((ctx) => {
      const signedExtensionsCtx = {
        metadata: ctx.metadata,
        chainHead: chainHead,
        callData: callData,
        at: atBlock.hash,
        from: signer.publicKey,
      }

      const mortality: Parameters<typeof CheckMortality>[0] = !hinted.mortality
        ? { period: 64, blockNumber: atBlock.number }
        : hinted.mortality.mortal
          ? { period: hinted.mortality.period, blockNumber: atBlock.number }
          : undefined // immortal

      return combineLatest(
        ctx.metadata.extrinsic.signedExtensions.map(
          ({ identifier, type, additionalSigned }) => {
            if (identifier === "CheckMortality")
              return CheckMortality(mortality, signedExtensionsCtx)

            if (identifier === "ChargeTransactionPayment")
              return ChargeTransactionPayment(hinted.tip ?? 0n)

            if (identifier === "ChargeAssetTxPayment")
              return ChargeAssetTxPayment(hinted.tip ?? 0n, hinted.asset)

            if (identifier === "CheckNonce" && "nonce" in hinted)
              return chainSignedExtensions.getNonce(hinted.nonce!)

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
          signer.signTx(
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
