import {
  type RpcMethodHandlers,
  type RpcMessage,
  createRpc,
} from "@substrate/light-client-extension-helpers/utils"
import { sr25519CreateDerive } from "@polkadot-labs/hdkd"
import {
  DEV_PHRASE,
  entropyToMiniSecret,
  mnemonicToEntropy,
  ss58Address,
} from "@polkadot-labs/hdkd-helpers"

import type { BackgroundRpcSpec } from "./types"

const entropy = mnemonicToEntropy(DEV_PHRASE)
const miniSecret = entropyToMiniSecret(entropy)
const derive = sr25519CreateDerive(miniSecret)

// TODO: fetch from storage
const keypairs = [
  derive("//westend//0"),
  derive("//westend//1"),
  derive("//westend//2"),
]

export const createBackgroundRpc = (
  sendMessage: (message: RpcMessage) => void,
) => {
  const handlers: RpcMethodHandlers<BackgroundRpcSpec> = {
    async getAccounts([_chainId]) {
      return keypairs.map(({ publicKey }) => ({
        address: ss58Address(publicKey, 42),
      }))
    },
    async createTx([_chainId, _from, _callData]) {
      return ""
    },
  }
  return createRpc(sendMessage, handlers)
}
