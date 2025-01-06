import {
  getDynamicBuilder,
  type MetadataLookup,
} from "@polkadot-api/metadata-builders"
import { fromHex } from "@polkadot-api/utils"
import { map, of } from "rxjs"
import type { ChainExtensionCtx } from "./internal-types.js"

export const empty = new Uint8Array()

export const genesisHashFromCtx = (ctx: ChainExtensionCtx) => {
  // there are chains (e.g. kilt) that use u64 as block number
  // u64 is encoded as bigint
  // using dynamic builder for safety
  const {
    keys: { enc },
  } = ctx.dynamicBuilder.buildStorage("System", "BlockHash")
  let key: string
  try {
    // for u32
    key = enc(0)
  } catch {
    // for u64
    key = enc(0n)
  }
  return ctx.chainHead
    .storage$(ctx.at, "value", () => key, null)
    .pipe(map((result) => fromHex(result!)))
}

export const systemVersionProp$ = (
  propName: string,
  lookupFn: MetadataLookup,
) => {
  const dynamicBuilder = getDynamicBuilder(lookupFn)

  const constant = lookupFn.metadata.pallets
    .find((x) => x.name === "System")!
    .constants!.find((s) => s.name === "Version")!

  const systemVersion = lookupFn(constant.type)
  const systemVersionDec = dynamicBuilder.buildDefinition(constant.type).dec

  if (systemVersion.type !== "struct") throw new Error("not a struct")

  const valueEnc = dynamicBuilder.buildDefinition(
    systemVersion.value[propName].id,
  ).enc

  return of(valueEnc(systemVersionDec(constant.value)[propName]))
}
