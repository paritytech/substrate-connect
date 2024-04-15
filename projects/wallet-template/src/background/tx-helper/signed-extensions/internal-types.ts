import { V15 } from "@polkadot-api/substrate-bindings"
import { Observable } from "rxjs"
import { getObservableClient } from "@polkadot-api/observable-client"

export interface ChainExtensionCtx {
  callData: Uint8Array
  from: Uint8Array
  metadata: V15
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
