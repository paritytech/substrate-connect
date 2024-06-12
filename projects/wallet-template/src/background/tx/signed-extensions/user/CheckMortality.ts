import { map, of } from "rxjs"
import { Bytes, enhanceEncoder, u16 } from "@polkadot-api/substrate-bindings"
import { fromHex } from "@polkadot-api/utils"
import { genesisHashFromCtx } from "../utils"
import { ChainExtensionCtx, SignedExtension } from "../internal-types"

function trailingZeroes(n: number) {
  let i = 0
  while (!(n & 1)) {
    i++
    n >>= 1
  }
  return i
}

const mortal = enhanceEncoder(
  Bytes(2).enc,
  (value: { period: number; phase: number }) => {
    const factor = Math.max(value.period >> 12, 1)
    const left = Math.min(Math.max(trailingZeroes(value.period) - 1, 1), 15)
    const right = (value.phase / factor) << 4
    return u16.enc(left | right)
  },
)

const zero = new Uint8Array([0])
export const CheckMortality = (
  input: { period: number; blockNumber: number } | undefined,
  ctx: ChainExtensionCtx,
): SignedExtension => {
  if (!input)
    return genesisHashFromCtx(ctx).pipe(
      map((additionalSigned) => ({
        additionalSigned,
        value: zero,
      })),
    )

  const { period, blockNumber } = input
  return of({
    additionalSigned: fromHex(ctx.at),
    value: mortal({
      period,
      phase: blockNumber % period,
    }),
  })
}
