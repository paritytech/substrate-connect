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
import {
  GetTxCreator,
  UserSignedExtensions,
  getTxCreator,
} from "@polkadot-api/tx-helper"
import { randomBytes } from "@noble/hashes/utils"

import type { BackgroundRpcSpec, SignRequest } from "./types"
import { keystoreV4, type KeystoreV4 } from "./keystore"
import { assert } from "./utils"
import * as storage from "./storage"

const entropy = mnemonicToEntropy(DEV_PHRASE)
const miniSecret = entropyToMiniSecret(entropy)
const derive = sr25519CreateDerive(miniSecret)

// TODO: fetch from storage
const keyset = {
  scheme: "Sr25519" as const,
  keypairs: [
    derive("//westend//0"),
    derive("//westend//1"),
    derive("//westend//2"),
  ],
}

const createKeyring = () => {
  const getKeystore = () => storage.get("password")
  const setKeystore = (keystore: KeystoreV4) =>
    storage.set("password", keystore)
  const removeKeystore = () => storage.remove("password")
  let isLocked = true

  return {
    async unlock(password: string) {
      const keystore = await getKeystore()
      assert(keystore, "keyring must be setup")
      if (!keystoreV4.verifyPassword(keystore, password))
        throw new Error("invalid password")
      isLocked = false
    },
    async lock() {
      assert(await getKeystore(), "keyring must be setup")
      isLocked = true
    },
    async isLocked() {
      assert(getKeystore(), "keyring must be setup")
      return isLocked
    },
    async changePassword(currentPassword: string, newPassword: string) {
      const keystore = await getKeystore()
      assert(keystore, "keyring must be setup")
      if (!keystoreV4.verifyPassword(keystore, currentPassword))
        throw new Error("invalid password")
      await setKeystore(
        keystoreV4.create(
          newPassword,
          keystoreV4.decrypt(keystore, currentPassword),
        ),
      )

      // TODO: re-encrypt accounts with new password
    },
    async setup(password: string) {
      assert(!(await getKeystore()), "keyring is already setup")
      await setKeystore(keystoreV4.create(password, randomBytes(32)))
      isLocked = false
    },
    async reset() {
      await removeKeystore()
      isLocked = true
    },
    async hasPassword() {
      return !!(await getKeystore())
    },
  }
}

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

  const listKeysets = async () => {
    const keysets = await storage.get("keysets")

    return keysets ?? []
  }

  const handlers: RpcMethodHandlers<BackgroundRpcSpec, Context> = {
    async getAccounts([chainId], { lightClientPageHelper }) {
      const chains = await lightClientPageHelper.getChains()
      const chain = chains.find(({ genesisHash }) => genesisHash === chainId)
      if (!chain) throw new Error("unknown chain")
      return keyset.keypairs.map(({ publicKey }) => ({
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
      const keypair = keyset.keypairs.find(
        ({ publicKey }) => toHex(publicKey) === from,
      )
      if (!keypair) throw new Error("unknown account")

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
            signingType: keyset.scheme,
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
    async upsertKeyset([keyset]) {
      const keysets = await listKeysets()
      const existingIdx = keysets.findIndex(
        (existing) => existing.name === keyset.name,
      )
      if (existingIdx !== -1) {
        keysets.splice(existingIdx, 1)
      }
      await storage.set("keysets", [...keysets, keyset])
    },
    async getKeyset([keysetName]) {
      const keysets = await listKeysets()
      return keysets.find((keyset) => keyset.name === keysetName)
    },
    listKeysets,
    async removeKeyset([keysetName]) {
      const keysets = await listKeysets()
      const existingIdx = keysets.findIndex(
        (keyset) => keyset.name === keysetName,
      )
      if (existingIdx !== -1) {
        keysets.splice(existingIdx, 1)
      }
      await storage.set("keysets", keysets)
    },
    async clearKeysets() {
      await storage.remove("keysets")
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
