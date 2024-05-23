import {
  type RpcMethodHandlers,
  createRpc,
} from "@substrate/light-client-extension-helpers/utils"
import { getLightClientProvider } from "@substrate/light-client-extension-helpers/web-page"
import * as SubstrateDiscovery from "@substrate/discovery"

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

const provider = getLightClientProvider(CHANNEL_ID).then(
  (lightClientProvider) => ({
    chains: {
      async addChain(chainSpec: string, relayChainGenesisHash?: string) {
        return lightClientProvider.getChain(chainSpec, relayChainGenesisHash)
      },
      getChains: lightClientProvider.getChains,
      addChainsChangeListener: lightClientProvider.addChainsChangeListener,
    },
    accounts: {
      async getAccounts(chainId: string) {
        return rpc.client.getAccounts(chainId)
      },
    },
    extrinsics: {
      async createTx(chainId: string, from: string, callData: string) {
        return rpc.client.createTx(chainId, from, callData)
      },
    },
  }),
)

const detail: SubstrateDiscovery.ProviderDetail = {
  info: PROVIDER_INFO,
  variants: {
    UnstableWalletProvider: provider,
    V1WalletProvider: provider,
  },
}

window.addEventListener(
  "substrateDiscovery:requestProvider",
  ({ detail: { onProvider } }) => onProvider(Object.freeze(detail)),
)

window.dispatchEvent(
  new CustomEvent("unstableWallet:announceProvider", {
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
