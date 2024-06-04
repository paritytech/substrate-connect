import type { SS58String } from "@polkadot-api/substrate-bindings"
import { toHex } from "@polkadot-api/utils"
import type { Unstable } from "@substrate/connect-discovery"
import { ss58Decode } from "@polkadot-labs/hdkd-helpers"

export const createTransaction = (
  provider: Unstable.Provider,
  chainId: string,
  from: SS58String,
  callData: string,
) => provider.createTx(chainId, toHex(ss58Decode(from)[0]), callData)
