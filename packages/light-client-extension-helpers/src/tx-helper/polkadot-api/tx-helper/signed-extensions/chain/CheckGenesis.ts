import { map } from "rxjs"
import type { GetChainSignedExtension } from "../internal-types.js"
import { empty, genesisHashFromCtx } from "../utils.js"

export const CheckGenesis: GetChainSignedExtension = (ctx) =>
  genesisHashFromCtx(ctx).pipe(
    map((additionalSigned) => ({ value: empty, additionalSigned })),
  )
