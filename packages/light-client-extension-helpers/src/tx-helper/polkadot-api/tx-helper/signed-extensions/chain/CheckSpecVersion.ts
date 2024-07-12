import { map } from "rxjs"
import type { GetChainSignedExtension } from "../internal-types"
import { empty, systemVersionProp$ } from "../utils"

export const CheckSpecVersion: GetChainSignedExtension = ({ metadata }) =>
  systemVersionProp$("spec_version", metadata).pipe(
    map((additionalSigned) => ({ additionalSigned, value: empty })),
  )
