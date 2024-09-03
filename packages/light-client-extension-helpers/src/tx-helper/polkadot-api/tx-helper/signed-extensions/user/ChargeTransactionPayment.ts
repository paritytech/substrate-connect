import { compactBn } from "@polkadot-api/substrate-bindings"
import { of } from "rxjs"
import { empty } from "../utils.js"
import type { SignedExtension } from "../internal-types.js"

export const ChargeTransactionPayment = (tip: bigint): SignedExtension =>
  of({
    value: compactBn.enc(tip),
    additionalSigned: empty,
  })
