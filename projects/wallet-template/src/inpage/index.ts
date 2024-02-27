import { createRpc } from "@substrate/light-client-extension-helpers/utils"
import { getLightClientProvider } from "@substrate/light-client-extension-helpers/web-page"
import type { UnstableWalletProviderDiscovery } from "@substrate/unstable-wallet-provider"

import type { BackgroundRpcSpec } from "../background/types"
import { CHANNEL_ID } from "../constants"

const PROVIDER_INFO = {
  uuid: crypto.randomUUID(),
  name: "Substrate Connect Wallet Template",
  icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>",
  rdns: "io.github.paritytech.SubstrateConnectWalletTemplate",
}

const rpc = createRpc((msg: any) =>
  window.postMessage({ msg, origin: "substrate-wallet-template/web" }),
).withClient<BackgroundRpcSpec>()
window.addEventListener("message", ({ data }) => {
  if (data?.origin !== "substrate-wallet-template/extension") return
  rpc.handle(data.msg, undefined)
})

const provider = getLightClientProvider(CHANNEL_ID).then(
  (lightClientProvider) => ({
    ...lightClientProvider,
    async getAccounts(chainId: string) {
      return rpc.client.getAccounts(chainId)
    },
    async createTx(chainId: string, from: string, callData: string) {
      return rpc.client.createTx(chainId, from, callData)
    },
  }),
)

const detail: UnstableWalletProviderDiscovery.Detail = Object.freeze({
  info: PROVIDER_INFO,
  provider,
})

window.addEventListener(
  "unstableWallet:requestProvider",
  ({ detail: { onProvider } }) => onProvider(detail),
)

window.dispatchEvent(
  new CustomEvent("unstableWallet:announceProvider", {
    detail,
  }),
)
