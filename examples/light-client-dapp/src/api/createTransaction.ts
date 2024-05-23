import * as SubstrateDiscovery from "@substrate/discovery"

import type { SS58String } from "@polkadot-api/substrate-bindings"
import { toHex } from "@polkadot-api/utils"
import { ss58Decode } from "@polkadot-labs/hdkd-helpers"

export const createTransaction = (
  api: NonNullable<SubstrateDiscovery.ExtrinsicsProvider["unstable"]>,
  chainId: string,
  from: SS58String,
  callData: string,
) => {
  return api.createTx(chainId, toHex(ss58Decode(from)[0]), callData)
}
