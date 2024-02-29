import {
  type RpcMethodHandlers,
  type RpcMessage,
  type RpcMethodMiddleware,
  createRpc,
  RpcError,
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

import type { BackgroundRpcSpec, SignRequest } from "./types"

const entropy = mnemonicToEntropy(DEV_PHRASE)
const miniSecret = entropyToMiniSecret(entropy)
const derive = sr25519CreateDerive(miniSecret)

// TODO: fetch from storage
const keypairs = [
  derive("//westend//0"),
  derive("//westend//1"),
  derive("//westend//2"),
]

type InternalSignRequest = {
  resolve: () => void
  reject: (reason?: any) => void
} & SignRequest

let nextSignRequestId = 0

export const createBackgroundRpc = (
  sendMessage: (message: RpcMessage) => void,
) => {
  type Context = {
    lightClientPageHelper: LightClientPageHelper
    signRequests: Record<string, InternalSignRequest>
    port: chrome.runtime.Port
  }
  const handlers: RpcMethodHandlers<BackgroundRpcSpec, Context> = {
    async getAccounts([chainId], { lightClientPageHelper }) {
      const chains = await lightClientPageHelper.getChains()
      const chain = chains.find(({ genesisHash }) => genesisHash === chainId)
      if (!chain) throw new Error("unknown chain")
      return keypairs.map(({ publicKey }) => ({
        address: ss58Address(publicKey, chain.ss58Format),
      }))
    },
    async createTx(
      [chainId, from, callData],
      { lightClientPageHelper, signRequests, port },
    ) {
      const url = port.sender?.url
      if (!url) throw new Error("unknown url")
      const chains = await lightClientPageHelper.getChains()
      const chain = chains.find(({ genesisHash }) => genesisHash === chainId)
      if (!chain) throw new Error("unknown chain")
      const keypair = keypairs.find(
        ({ publicKey }) => toHex(publicKey) === from,
      )
      if (!keypair) throw new Error("unknown account")

      const id = nextSignRequestId++
      const signRequest = new Promise<void>(
        (resolve, reject) =>
          (signRequests[id] = {
            resolve,
            reject,
            chainId,
            url,
            address: ss58Address(from, chain.ss58Format),
            callData,
          }),
      )

      const window = await chrome.windows.create({
        focused: true,
        height: 600,
        left: 150,
        top: 150,
        type: "popup",
        url: chrome.runtime.getURL(
          `ui/assets/wallet-popup.html#signRequest/${id}`,
        ),
        width: 560,
      })
      try {
        await signRequest
      } finally {
        delete signRequests[id]
        chrome.windows.remove(window.id!)
      }

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
            // FIXME: this should be inferred from the keypair signature scheme
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
    async getSignRequests([], { signRequests }) {
      return signRequests
    },
    async approveSignRequest([id], { signRequests }) {
      signRequests[id]?.resolve()
    },
    async cancelSignRequest([id], { signRequests }) {
      signRequests[id]?.reject()
    },
  }

  type Method = keyof BackgroundRpcSpec
  const ALLOWED_WEB_METHODS: Method[] = ["createTx", "getAccounts"]
  const allowedMethodsMiddleware: RpcMethodMiddleware<Context> = async (
    next,
    request,
    context,
  ) => {
    const { port } = context
    if (
      port.name === "substrate-wallet-template" &&
      !ALLOWED_WEB_METHODS.includes(request.method as Method)
    )
      throw new RpcError("Method not found", -32601)
    return next(request, context)
  }
  return createRpc(sendMessage, handlers, [allowedMethodsMiddleware])
}
