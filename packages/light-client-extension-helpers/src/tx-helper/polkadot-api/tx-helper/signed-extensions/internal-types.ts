import { Observable } from "rxjs"
import { getObservableClient } from "@polkadot-api/observable-client"
import type { MetadataLookup } from "@polkadot-api/metadata-builders"

export interface ChainExtensionCtx {
  callData: Uint8Array
  from: Uint8Array
  lookupFn: MetadataLookup
  at: string
  chainHead: ReturnType<ReturnType<typeof getObservableClient>["chainHead$"]>
}

export type SignedExtension = Observable<{
  value: Uint8Array
  additionalSigned: Uint8Array
}>

export type GetChainSignedExtension = (
  ctx: ChainExtensionCtx,
) => SignedExtension
