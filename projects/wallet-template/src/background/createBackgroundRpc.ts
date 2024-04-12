import {
  type RpcMethodHandlers,
  type RpcMessage,
  type RpcMethodMiddleware,
  createRpc,
  RpcError,
} from "@substrate/light-client-extension-helpers/utils"
import type { LightClientPageHelper } from "@substrate/light-client-extension-helpers/background"
import { ss58Address, ss58Decode } from "@polkadot-labs/hdkd-helpers"
import {
  GetTxCreator,
  UserSignedExtensions,
  getTxCreator,
} from "@polkadot-api/tx-helper"
import { toHex, fromHex } from "@polkadot-api/utils"
import { Bytes, Variant } from "@polkadot-api/substrate-bindings"
import type { Account, BackgroundRpcSpec, SignRequest } from "./types"
import { createKeyring } from "./keyring"
import { getSignaturePayload, getUserSignedExtensions } from "./pjs"
import type { InPageRpcSpec } from "../inpage/types"

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
    notifyOnAccountsChanged: (accounts: Account[]) => void
  }

  const getAccounts: RpcMethodHandlers<
    BackgroundRpcSpec,
    Context
  >["getAccounts"] = async ([chainId], { lightClientPageHelper }) => {
    const chains = await lightClientPageHelper.getChains()
    const chain = chains.find(({ genesisHash }) => genesisHash === chainId)
    if (!chain) throw new Error("unknown chain")
    return (await keyring.getAccounts(chainId)).map(({ publicKey }) => ({
      address: ss58Address(publicKey, chain.ss58Format),
    }))
  }

  const notifyOnAccountsChanged = async (context: Context) =>
    context.notifyOnAccountsChanged(
      (
        await Promise.all(
          (await context.lightClientPageHelper.getChains()).map(
            ({ genesisHash }) => getAccounts([genesisHash], context),
          ),
        )
      ).flatMap((accounts) => accounts),
    )

  const handlers: RpcMethodHandlers<BackgroundRpcSpec, Context> = {
    getAccounts,
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
              userSignedExtensions: {
                type: "names",
                names: userSingedExtensionsName,
              },
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
    async pjsSignPayload(
      [payload],
      { port, lightClientPageHelper, signRequests },
    ) {
      const url = port.sender?.url
      if (!url) throw new Error("unknown url")
      const chains = await lightClientPageHelper.getChains()
      const chain = chains.find(
        ({ genesisHash }) => genesisHash === payload.genesisHash,
      )
      if (!chain) throw new Error("unknown chain")
      const publicKey = toHex(ss58Decode(payload.address)[0])
      const [keypair, scheme] = await keyring.getKeypair(
        payload.genesisHash,
        publicKey,
      )
      const id = nextSignRequestId++
      const signRequest = new Promise<
        Parameters<InternalSignRequest["resolve"]>[0]
      >(
        (resolve, reject) =>
          (signRequests[id] = {
            resolve,
            reject,
            chainId: payload.genesisHash,
            url,
            address: payload.address,
            callData: payload.method,
            userSignedExtensions: {
              type: "values",
              values: getUserSignedExtensions(payload),
            },
          }),
      )
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
        await signRequest
      } finally {
        delete signRequests[id]
        chrome.windows.remove(window.id!)
        port.onDisconnect.removeListener(removeWindow)
        chrome.windows.onRemoved.removeListener(onWindowsRemoved)
      }
      const signaturePayload = await getSignaturePayload(
        chain.provider,
        payload,
      )
      const multiSignatureEncoder = Variant({
        Ed25519: Bytes(64),
        Sr25519: Bytes(64),
        Ecdsa: Bytes(65),
      }).enc
      return toHex(
        // @ts-expect-error scheme type is incompatible with type
        multiSignatureEncoder({
          type: scheme,
          value: keypair.sign(signaturePayload),
        }),
      )
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
    async insertCryptoKey([args], context) {
      const existingKey = await keyring.getCryptoKey(args.name)

      if (existingKey)
        throw new Error(`crypto key "${args.name}" already exists`)
      await keyring.insertCryptoKey(args)
      notifyOnAccountsChanged(context)
    },
    async updateCryptoKey([_]) {
      throw new Error("not implemented")
    },
    async getCryptoKey([name]) {
      return keyring.getCryptoKey(name)
    },
    async getCryptoKeys() {
      return keyring.getCryptoKeys()
    },
    async removeCryptoKey([name], context) {
      await keyring.removeCryptoKey(name)
      notifyOnAccountsChanged(context)
    },
    async clearCryptoKeys([], context) {
      await keyring.clearCryptoKeys()
      notifyOnAccountsChanged(context)
    },
    async getKeyringState() {
      return {
        isLocked: await keyring.isLocked(),
        hasPassword: await keyring.hasPassword(),
      }
    },
  }

  type Method = keyof BackgroundRpcSpec
  const ALLOWED_WEB_METHODS: Method[] = [
    "createTx",
    "getAccounts",
    "pjsSignPayload",
  ]
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
  return createRpc(sendMessage, handlers, [
    allowedMethodsMiddleware,
  ]).withClient<InPageRpcSpec>()
}
