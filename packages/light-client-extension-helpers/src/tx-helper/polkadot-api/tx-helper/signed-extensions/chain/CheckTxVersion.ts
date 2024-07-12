import { map } from "rxjs"
import type { GetChainSignedExtension } from "../internal-types"
import { empty, systemVersionProp$ } from "../utils"

export const CheckTxVersion: GetChainSignedExtension = ({ metadata }) =>
  systemVersionProp$("transaction_version", metadata).pipe(
    map((additionalSigned) => ({ additionalSigned, value: empty })),
  )
