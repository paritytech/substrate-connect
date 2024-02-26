import {
  type RpcMethodHandlers,
  type RpcMessage,
  createRpc,
} from "@substrate/light-client-extension-helpers/utils"
import type { LightClientPageHelper } from "@substrate/light-client-extension-helpers/background"
import { sr25519CreateDerive } from "@polkadot-labs/hdkd"
import {
  DEV_PHRASE,
  entropyToMiniSecret,
  mnemonicToEntropy,
  ss58Address,
} from "@polkadot-labs/hdkd-helpers"
import { toHex, fromHex } from "@polkadot-api/utils"
import { UserSignedExtensions, getTxCreator } from "@polkadot-api/tx-helper"

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
  type Context = { lightClientPageHelper: LightClientPageHelper }
  const handlers: RpcMethodHandlers<BackgroundRpcSpec, Context> = {
    async getAccounts([chainId], { lightClientPageHelper }) {
      const chains = await lightClientPageHelper.getChains()
      const chain = chains.find(({ genesisHash }) => genesisHash === chainId)
      if (!chain) throw new Error("unknown chain")
      return keypairs.map(({ publicKey }) => ({
        address: ss58Address(publicKey, chain.ss58Format),
      }))
    },
    async createTx([chainId, from, callData], { lightClientPageHelper }) {
      const chains = await lightClientPageHelper.getChains()
      const chain = chains.find(({ genesisHash }) => genesisHash === chainId)
      if (!chain) throw new Error("unknown chain")
      const keypair = keypairs.find(
        ({ publicKey }) => toHex(publicKey) === from,
      )
      if (!keypair) throw new Error("unknown account")
      // FIXME: trigger prompt to show the decoded transaction details
      const txCreator = getTxCreator(
        chain.provider,
        ({ userSingedExtensionsName }, callback) => {
          // FIXME: trigger prompt for signed extensions
          const userSignedExtensionsData = Object.fromEntries(
            userSingedExtensionsName.map((x) => {
              if (x === "CheckMortality") {
                const result: UserSignedExtensions["CheckMortality"] = {
                  mortal: false,
                  // period: 128,
                }
                return [x, result]
              }

              if (x === "ChargeTransactionPayment") return [x, 0n]
              return [x, { tip: 0n }]
            }),
          )

          callback({
            userSignedExtensionsData,
            overrides: {},
            signingType: "Sr25519",
            signer: async (value) => keypair.sign(value),
          })
        },
      )
      const tx = toHex(
        await txCreator.createTx(fromHex(from), fromHex(callData)),
      )
      txCreator.destroy()
      return tx
    },
  }
  return createRpc(sendMessage, handlers)
}
