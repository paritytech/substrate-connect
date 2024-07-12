import { mergeMap, of } from "rxjs"
import { compact, u16, u32, u64, u8 } from "@polkadot-api/substrate-bindings"
import type {
  GetChainSignedExtension,
  SignedExtension,
} from "../internal-types"
import { empty } from "../utils"
import { fromHex, toHex } from "@polkadot-api/utils"

const NONCE_RUNTIME_CALL = "AccountNonceApi_account_nonce"
const lenToDecoder = {
  1: u8.dec,
  2: u16.dec,
  4: u32.dec,
  8: u64.dec,
}

export const getNonce = (input: number | bigint): SignedExtension =>
  of({ value: compact.enc(input), additionalSigned: empty })

export const CheckNonce: GetChainSignedExtension = (ctx) =>
  ctx.chainHead.call$(ctx.at, NONCE_RUNTIME_CALL, toHex(ctx.from)).pipe(
    mergeMap((result) => {
      const bytes = fromHex(result)
      const decoder = lenToDecoder[bytes.length as 2 | 4 | 8]
      if (!decoder)
        throw new Error(`${NONCE_RUNTIME_CALL} retrieved wrong data`)
      return getNonce(decoder(bytes))
    }),
  )
