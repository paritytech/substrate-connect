import { map } from "rxjs"
import type { GetChainSignedExtension } from "../internal-types.js"
import { empty, systemVersionProp$ } from "../utils.js"

export const CheckTxVersion: GetChainSignedExtension = ({ lookupFn }) =>
  systemVersionProp$("transaction_version", lookupFn).pipe(
    map((additionalSigned) => ({ additionalSigned, value: empty })),
  )
