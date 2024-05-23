import type { SS58String } from "@polkadot-api/substrate-bindings"
import { toHex } from "@polkadot-api/utils"
import * as SubstrateDiscovery from "@substrate/discovery"
import { ss58Decode } from "@polkadot-labs/hdkd-helpers"

export const createTransaction = (
  provider: SubstrateDiscovery.UnstableWalletProvider,
  chainId: string,
  from: SS58String,
  callData: string,
) =>
  provider.extrinsics?.createTx(chainId, toHex(ss58Decode(from)[0]), callData)
