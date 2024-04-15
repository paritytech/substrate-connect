import { map } from "rxjs"
import type { GetChainSignedExtension } from "../internal-types"
import { empty, genesisHashFromCtx } from "../utils"

export const CheckGenesis: GetChainSignedExtension = (ctx) =>
  genesisHashFromCtx(ctx).pipe(
    map((additionalSigned) => ({ value: empty, additionalSigned })),
  )
