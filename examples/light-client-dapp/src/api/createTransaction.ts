import type { SS58String } from "@polkadot-api/substrate-bindings"
import { toHex } from "@polkadot-api/utils"
import type { UnstableWallet } from "@substrate/unstable-wallet-provider"
import { ss58Decode } from "@polkadot-labs/hdkd-helpers"

export const createTransaction = (
  provider: UnstableWallet.Provider,
  chainId: string,
  from: SS58String,
  callData: string,
) => provider.createTx(chainId, toHex(ss58Decode(from)[0]), callData)
