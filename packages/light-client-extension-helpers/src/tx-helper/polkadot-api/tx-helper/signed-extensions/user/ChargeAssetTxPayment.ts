import { of } from "rxjs"
import {
  Bytes,
  Option,
  Struct,
  compact,
} from "@polkadot-api/substrate-bindings"
import { empty } from "../utils"
import { SignedExtension } from "../internal-types"

const encoder = Struct({
  tip: compact,
  asset: Option(Bytes(Infinity)),
}).enc

export const ChargeAssetTxPayment = (
  tip: number | bigint,
  asset: Uint8Array | undefined,
): SignedExtension =>
  of({
    value: encoder({
      tip,
      asset,
    }),
    additionalSigned: empty,
  })
