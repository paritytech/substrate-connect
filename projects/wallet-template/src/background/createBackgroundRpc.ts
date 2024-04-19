import {
  type RpcMethodHandlers,
  type RpcMessage,
  type RpcMethodMiddleware,
  createRpc,
  RpcError,
} from "@substrate/light-client-extension-helpers/utils"
import { ss58Address, ss58Decode } from "@polkadot-labs/hdkd-helpers"
import { toHex, fromHex } from "@polkadot-api/utils"
import { getPolkadotSigner } from "@polkadot-api/signer"

import type { BackgroundRpcSpec } from "./types"
import { createKeyring } from "./keyring"
import { UserSignedExtensionName } from "../types/UserSignedExtension"
import { createClient } from "@polkadot-api/substrate-client"
import { getObservableClient } from "@polkadot-api/observable-client"
import { filter, firstValueFrom, map, mergeMap, take } from "rxjs"
import { getCreateTx } from "./tx-helper"
import * as pjs from "./pjs"
import { Bytes, Variant } from "@polkadot-api/substrate-bindings"
import { InPageRpcSpec } from "../inpage/types"
import { Context, InternalSignRequest } from "./rpc/types"
import { addChainSpecHandler, listChainSpecsHandler } from "./rpc/chainspec"

const isUserSignedExtensionName = (s: string): s is UserSignedExtensionName => {
  return (
    s === "CheckMortality" ||
    s === "ChargeTransactionPayment" ||
    s === "ChargeAssetTxPayment"
  )
}

const keyring = createKeyring()

let nextSignRequestId = 0

export const createBackgroundRpc = (
  sendMessage: (message: RpcMessage) => void,
) => {
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

      const id = nextSignRequestId++
      const client = getObservableClient(createClient(chain.provider))
      const chainHead$ = client.chainHead$()

      const { best: atBlock, userSignedExtensionNames } = await firstValueFrom(
        chainHead$.best$.pipe(
          mergeMap((blockInfo) =>
            chainHead$.getRuntimeContext$(blockInfo.hash).pipe(
              take(1),
              map(({ metadata }) =>
                metadata.extrinsic.signedExtensions
                  .map(({ identifier }) => identifier)
                  .filter(isUserSignedExtensionName),
              ),
              map((userSignedExtensionNames) => ({
                best: blockInfo,
                userSignedExtensionNames,
              })),
            ),
          ),
          filter(Boolean),
        ),
      )

      try {
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
              userSignedExtensions: {
                type: "names",
                names: userSignedExtensionNames,
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
          const { userSignedExtensions } = await signRequest

          const signer = getPolkadotSigner(
            keypair.publicKey,
            scheme,
            keypair.sign,
          )
          const createTx = getCreateTx(chainHead$)

          const mortality = userSignedExtensions.CheckMortality ?? {
            mortal: true,
            period: 128,
          }
          const asset = userSignedExtensions.ChargeAssetTxPayment?.asset
          const tip =
            (asset
              ? userSignedExtensions.ChargeAssetTxPayment?.tip
              : userSignedExtensions.ChargeTransactionPayment) ?? 0n

          const tx = await firstValueFrom(
            createTx(signer, fromHex(callData), atBlock, {
              mortality,
              asset,
              tip,
            }).pipe(filter(Boolean)),
          )

          return toHex(tx)
        } finally {
          delete signRequests[id]
          chrome.windows.remove(window.id!)
          port.onDisconnect.removeListener(removeWindow)
          chrome.windows.onRemoved.removeListener(onWindowsRemoved)
        }
      } finally {
        chainHead$.unfollow()
        client.destroy()
      }
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
              values: pjs.getUserSignedExtensions(payload),
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
      const signaturePayload = await pjs.getSignaturePayload(
        chain.provider,
        payload,
      )
      const multiSignatureEncoder = Variant({
        Ed25519: Bytes(64),
        Sr25519: Bytes(64),
        Ecdsa: Bytes(65),
      }).enc
      const [keypair, scheme] = await keyring.getKeypair(
        payload.genesisHash,
        toHex(ss58Decode(payload.address)[0]),
      )
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
    async clearCryptoKeys(_, context) {
      await keyring.clearCryptoKeys()
      notifyOnAccountsChanged(context)
    },
    async getKeyringState() {
      return {
        isLocked: await keyring.isLocked(),
        hasPassword: await keyring.hasPassword(),
      }
    },
    getChainSpecs: listChainSpecsHandler,
    addChainSpec: addChainSpecHandler,
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
