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
import { getPolkadotSigner } from "@polkadot-api/signer"

import type { BackgroundRpcSpec, SignRequest } from "./types"
import { createKeyring } from "./keyring"
import { UserSignedExtensions } from "../types/UserSignedExtension"
import { createClient } from "@polkadot-api/substrate-client"
import { getObservableClient } from "@polkadot-api/observable-client"
import { filter, firstValueFrom } from "rxjs"

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

      const signer = getPolkadotSigner(keypair.publicKey, scheme, keypair.sign)
      const client = getObservableClient(createClient(chain.provider))
      const id = nextSignRequestId++

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

      const { metadata$, best$, unfollow } = client.chainHead$()
      try {
        const metadata = await firstValueFrom(metadata$.pipe(filter(Boolean)))
        const best = await firstValueFrom(best$.pipe(filter(Boolean)))
        const tx = await signer.sign(
          fromHex(callData),
          // TODO: wait for getCreateTx to be exported from polkadot api
          {} as unknown,
          metadata,
          best,
        )

        return toHex(tx)
      } catch (err) {
        console.error(err)
        throw err
      } finally {
        unfollow()
        client.destroy()
      }
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
    async insertCryptoKey([args]) {
      const existingKey = await keyring.getCryptoKey(args.name)

      if (existingKey)
        throw new Error(`crypto key "${args.name}" already exists`)
      await keyring.insertCryptoKey(args)
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
    async removeCryptoKey([name]) {
      await keyring.removeCryptoKey(name)
    },
    async clearCryptoKeys() {
      await keyring.clearCryptoKeys()
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
