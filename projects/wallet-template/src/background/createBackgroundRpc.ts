import {
  type RpcMethodHandlers,
  type RpcMessage,
  type RpcMethodMiddleware,
  createRpc,
  RpcError,
} from "@substrate/light-client-extension-helpers/utils"
import type { LightClientPageHelper } from "@substrate/light-client-extension-helpers/background"
import { ss58Address } from "@polkadot-labs/hdkd-helpers"
import { toHex, fromHex } from "@polkadot-api/utils"
import {
  GetTxCreator,
  UserSignedExtensions,
  getTxCreator,
} from "@polkadot-api/tx-helper"

import type { BackgroundRpcSpec, SignRequest } from "./types"
import { createKeyring } from "./keyring"

const keyring = createKeyring()

type SignResponse = {
  userSignedExtensions: Partial<UserSignedExtensions>
}

type InternalSignRequest = {
  resolve: (props: SignResponse) => void
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
      return (await keyring.getAccounts(chainId)).map(({ publicKey }) => ({
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
      const [keypair, scheme] = await keyring.getKeypair(chainId, from)
      const onCreateTx: Parameters<GetTxCreator>[1] = async (
        { userSingedExtensionsName },
        callback,
      ) => {
        const id = nextSignRequestId++
        const signRequest = new Promise<
          Parameters<InternalSignRequest["resolve"]>[0]
        >(
          (resolve, reject) =>
            (signRequests[id] = {
              resolve,
              reject,
              chainId,
              url,
              address: ss58Address(from, chain.ss58Format),
              callData,
              // TODO: revisit, it might be better to query the user signed extensions from the popup
              userSignedExtensionNames: userSingedExtensionsName,
            }),
        )
        // FIXME: if this throws, onCreateTx does not propagate the error
        const window = await chrome.windows.create({
          focused: true,
          height: 700,
          left: 150,
          top: 150,
          type: "popup",
          url: chrome.runtime.getURL(
            `ui/assets/wallet-popup.html#/sign-request/${id}`,
          ),
          width: 560,
        })
        const removeWindow = () => chrome.windows.remove(window.id!)
        port.onDisconnect.addListener(removeWindow)
        const onWindowsRemoved = (windowId: number) => {
          if (windowId !== window.id) return
          const signRequest = signRequests[id]
          if (!signRequest) return
          signRequest.reject()
        }
        chrome.windows.onRemoved.addListener(onWindowsRemoved)
        try {
          const { userSignedExtensions } = await signRequest
          const userSignedExtensionsData = Object.fromEntries(
            userSingedExtensionsName.map((x) => {
              switch (x) {
                case "CheckMortality": {
                  return [
                    x,
                    userSignedExtensions[x] ?? {
                      mortal: true,
                      period: 128,
                    },
                  ]
                }
                case "ChargeTransactionPayment": {
                  return [x, userSignedExtensions[x] ?? 0n]
                }
                case "ChargeAssetTxPayment": {
                  return [x, userSignedExtensions[x] ?? { tip: 0n }]
                }
                default:
                  throw new Error(`Unknown user signed extension: ${x}`)
              }
            }),
          )
          callback({
            userSignedExtensionsData,
            overrides: {},
            signingType: scheme,
            signer: async (value) => keypair.sign(value),
          })
        } catch (error) {
          console.error(error)
          // TODO: How to throw a custom error from onCreateTx?
          callback(null)
        } finally {
          delete signRequests[id]
          chrome.windows.remove(window.id!)
          port.onDisconnect.removeListener(removeWindow)
          chrome.windows.onRemoved.removeListener(onWindowsRemoved)
        }
      }
      const txCreator = getTxCreator(chain.provider, onCreateTx)
      const tx = toHex(
        await txCreator.createTx(fromHex(from), fromHex(callData)),
      )
      txCreator.destroy()
      return tx
    },
    async getSignRequests(_, { signRequests }) {
      return signRequests
    },
    async approveSignRequest([id, userSignedExtensions], { signRequests }) {
      signRequests[id]?.resolve({
        userSignedExtensions,
      })
    },
    async cancelSignRequest([id], { signRequests }) {
      signRequests[id]?.reject()
    },
    async lockKeyring() {
      return keyring.lock()
    },
    async unlockKeyring([password]) {
      return keyring.unlock(password)
    },
    async changePassword([currentPassword, newPassword]) {
      return keyring.changePassword(currentPassword, newPassword)
    },
    async createPassword([password]) {
      return keyring.setup(password)
    },
    async insertKeyset([args]) {
      const existingKeyset = await keyring.getKeyset(args.name)
      if (existingKeyset)
        throw new Error(`keyset "${args.name}" already exists`)
      await keyring.insertKeyset(args)
    },
    async updateKeyset([_keyset]) {
      throw new Error("not implemented")
    },
    async getKeyset([keysetName]) {
      return keyring.getKeyset(keysetName)
    },
    async getKeysets() {
      return keyring.getKeysets()
    },
    async removeKeyset([keysetName]) {
      await keyring.removeKeyset(keysetName)
    },
    async importPrivateKey([args]) {
      await keyring.importPrivateKey(args.keysetName, args.privatekey)
    },
    async clearKeysets() {
      await keyring.clearKeysets()
    },
    async getKeyringState() {
      return {
        isLocked: await keyring.isLocked(),
        hasPassword: await keyring.hasPassword(),
      }
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
