import { compactBn } from "@polkadot-api/substrate-bindings"
import { of } from "rxjs"
import { empty } from "../utils"
import { SignedExtension } from "../internal-types"

export const ChargeTransactionPayment = (tip: bigint): SignedExtension =>
  of({
    value: compactBn.enc(tip),
    additionalSigned: empty,
  })
