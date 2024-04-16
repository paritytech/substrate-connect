import { createClient } from "@polkadot-api/substrate-client"
import { getObservableClient } from "@polkadot-api/observable-client"
import { getDynamicBuilder } from "@polkadot-api/metadata-builders"
import {
  Bytes,
  Struct,
  _void,
  compact,
  u32,
  Option,
  u16,
} from "@polkadot-api/substrate-bindings"
import { fromHex, mergeUint8 } from "@polkadot-api/utils"
import { filter, firstValueFrom } from "rxjs"
import { blake2b256 } from "@polkadot-labs/hdkd-helpers"
import type { Pjs } from "./types"
import { UserSignedExtensions } from "../types/UserSignedExtension"
import type { JsonRpcProvider } from "@polkadot-api/json-rpc-provider"

export const getSignaturePayload = async (
  provider: JsonRpcProvider,
  payload: Pjs.SignerPayloadJSON,
) => {
  const { metadata$, unfollow } = getObservableClient(
    createClient(provider),
  ).chainHead$()
  const metadata = await firstValueFrom(
    metadata$.pipe(filter(Boolean)),
  ).finally(unfollow)
  const dynamicBuilder = getDynamicBuilder(metadata)
  const [extra, additionalSigned] = metadata.extrinsic.signedExtensions.reduce<
    [extra: Uint8Array[], additionalSigned: Uint8Array[]]
  >(
    (
      [extra, additionalSigned],
      { identifier, type: extraTy, additionalSigned: additionalSignedTy },
    ) => {
      switch (identifier) {
        case "CheckSpecVersion": {
          additionalSigned.push(u32.enc(Number(payload.specVersion)))
          break
        }
        case "CheckTxVersion": {
          additionalSigned.push(u32.enc(Number(payload.transactionVersion)))
          break
        }
        case "CheckGenesis": {
          additionalSigned.push(fromHex(payload.genesisHash))
          break
        }
        case "CheckMortality": {
          extra.push(fromHex(payload.era))
          additionalSigned.push(fromHex(payload.blockHash))
          break
        }
        case "CheckNonce": {
          extra.push(compact.enc(Number(payload.nonce)))
          break
        }
        case "ChargeTransactionPayment": {
          extra.push(compact.enc(BigInt(payload.tip)))
          break
        }
        case "ChargeAssetTxPayment": {
          extra.push(
            Struct({
              tip: compact,
              asset: Option(Bytes(Infinity)),
            }).enc({
              tip: BigInt(payload.tip),
              // TODO: update when PJS adds support
              asset: undefined,
            }),
          )
          break
        }
        default: {
          if (
            dynamicBuilder.buildDefinition(extraTy) === _void &&
            dynamicBuilder.buildDefinition(additionalSignedTy) === _void
          )
            break
          throw new Error(`unsupported signed-extension: ${identifier}`)
        }
      }
      return [extra, additionalSigned]
    },
    [[], []],
  )
  const signaturePayload = mergeUint8(
    fromHex(payload.method),
    ...extra,
    ...additionalSigned,
  )
  return signaturePayload.length > 256
    ? blake2b256(signaturePayload)
    : signaturePayload
}

export const getUserSignedExtensions = (payload: Pjs.SignerPayloadJSON) => {
  const userSignedExtensions: Partial<UserSignedExtensions> = {}
  const mortality = fromHex(payload.era)
  userSignedExtensions.CheckMortality =
    // Ser mortality encoding https://spec.polkadot.network/id-extrinsics#sect-mortality-encoding
    mortality.length === 1
      ? { mortal: false }
      : { mortal: true, period: 2 << u16.dec(mortality) % (1 << 4) }
  if (payload.signedExtensions.includes("ChargeTransactionPayment"))
    // @ts-expect-error FIXME: bigint needs to be serialized
    userSignedExtensions.ChargeTransactionPayment = Number(payload.tip)
  else if (payload.signedExtensions.includes("ChargeAssetTxPayment"))
    userSignedExtensions.ChargeAssetTxPayment = {
      // @ts-expect-error FIXME: bigint needs to be serialized
      tip: Number(payload.tip),
    }

  return userSignedExtensions
}
