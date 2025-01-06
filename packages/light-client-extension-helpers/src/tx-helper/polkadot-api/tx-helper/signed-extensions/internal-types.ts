import { Observable } from "rxjs"
import type { ChainHead$ } from "@polkadot-api/observable-client"
import type {
  MetadataLookup,
  getDynamicBuilder,
} from "@polkadot-api/metadata-builders"

export interface ChainExtensionCtx {
  callData: Uint8Array
  from: Uint8Array
  lookupFn: MetadataLookup
  dynamicBuilder: ReturnType<typeof getDynamicBuilder>
  at: string
  chainHead: ChainHead$
}

export type SignedExtension = Observable<{
  value: Uint8Array
  additionalSigned: Uint8Array
}>

export type GetChainSignedExtension = (
  ctx: ChainExtensionCtx,
) => SignedExtension
