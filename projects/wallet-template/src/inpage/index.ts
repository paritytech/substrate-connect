import {
  type RpcMethodHandlers,
  createRpc,
} from "@substrate/light-client-extension-helpers/utils"
import { getLightClientProvider } from "@substrate/light-client-extension-helpers/web-page"
import type { Unstable } from "@substrate/connect-discovery"
import type { SmoldotExtensionProviderDetail } from "@substrate/smoldot-discovery/types"
import { connector as smoldotDiscoveryConnector } from "@substrate/smoldot-discovery"
import "@substrate/discovery"

import type { Account, BackgroundRpcSpec } from "../background/types"
import { CHANNEL_ID } from "../constants"
import { pjsInject } from "./pjsInject"
import type { InPageRpcSpec } from "./types"

const PROVIDER_INFO = {
  uuid: crypto.randomUUID(),
  name: "Substrate Connect Wallet Template",
  icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>",
  rdns: "io.github.paritytech.SubstrateConnectWalletTemplate",
}

type OnAccountsChangedCallback = (accounts: Account[]) => void
const onAccountsChangedCallbacks: OnAccountsChangedCallback[] = []
const subscribeOnAccountsChanged = (cb: OnAccountsChangedCallback) => {
  onAccountsChangedCallbacks.push(cb)
  return () => {
    onAccountsChangedCallbacks.splice(onAccountsChangedCallbacks.indexOf(cb), 1)
  }
}
const handlers: RpcMethodHandlers<InPageRpcSpec> = {
  onAccountsChanged([accounts]) {
    onAccountsChangedCallbacks.forEach((cb) => cb(accounts))
  },
}
const rpc = createRpc(
  (msg: any) =>
    window.postMessage({ msg, origin: "substrate-wallet-template/web" }),
  handlers,
).withClient<BackgroundRpcSpec>()
window.addEventListener("message", ({ data }) => {
  if (data?.origin !== "substrate-wallet-template/extension") return
  rpc.handle(data.msg, undefined)
})

const lightClientProvider = getLightClientProvider(CHANNEL_ID)

// #region Smoldot Discovery Provider
{
  const provider = lightClientProvider.then((provider) =>
    smoldotDiscoveryConnector.make({ lightClientProvider: provider }),
  )

  const detail: SmoldotExtensionProviderDetail = Object.freeze({
    kind: "smoldot-v1",
    info: PROVIDER_INFO,
    provider,
  })

  window.addEventListener(
    "substrateDiscovery:requestProvider",
    ({ detail: { onProvider } }) => onProvider(detail),
  )

  window.dispatchEvent(
    new CustomEvent("substrateDiscovery:announceProvider", {
      detail,
    }),
  )
}
// #endregion

// #region Connect Discovery Provider
{
  const provider = lightClientProvider.then((lightClientProvider) => ({
    ...lightClientProvider,
    async getAccounts(chainId: string) {
      return rpc.client.getAccounts(chainId)
    },
    async createTx(chainId: string, from: string, callData: string) {
      return rpc.client.createTx(chainId, from, callData)
    },
  }))

  const detail: Unstable.SubstrateConnectProviderDetail = Object.freeze({
    kind: "substrate-connect-unstable",
    info: PROVIDER_INFO,
    provider,
  })

  window.addEventListener(
    "substrateDiscovery:requestProvider",
    ({ detail: { onProvider } }) => onProvider(detail),
  )

  window.dispatchEvent(
    new CustomEvent("substrateDiscovery:announceProvider", {
      detail,
    }),
  )

  pjsInject({
    name: PROVIDER_INFO.name,
    version: "0.0.1",
    rpc: rpc.client,
    providerPromise: provider,
    subscribeOnAccountsChanged,
  })
}
//#endregion
