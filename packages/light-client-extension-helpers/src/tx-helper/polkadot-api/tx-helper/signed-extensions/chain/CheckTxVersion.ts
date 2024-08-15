import { map } from "rxjs"
import type { GetChainSignedExtension } from "../internal-types"
import { empty, systemVersionProp$ } from "../utils"

export const CheckTxVersion: GetChainSignedExtension = ({ lookupFn }) =>
  systemVersionProp$("transaction_version", lookupFn).pipe(
    map((additionalSigned) => ({ additionalSigned, value: empty })),
  )
