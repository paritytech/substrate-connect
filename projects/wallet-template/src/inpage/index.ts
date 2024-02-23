import { DOM_ELEMENT_ID } from "@substrate/connect-extension-protocol"
import {
  getLightClientProvider,
  type UnstableWalletProviderDiscovery,
} from "@substrate/light-client-extension-helpers/web-page"

const PROVIDER_INFO = {
  uuid: crypto.randomUUID(),
  name: "Substrate Connect Wallet Template",
  icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>",
  rdns: "io.github.paritytech.SubstrateConnectWalletTemplate",
}

const provider = getLightClientProvider(DOM_ELEMENT_ID).then(
  (lightClientProvider) => ({
    ...lightClientProvider,
    async getAccounts(): Promise<{ address: string }[]> {
      // TODO: make rpc call
      return [{ address: "address-1" }, { address: "address-2" }]
    },
    async createTx() {
      // TODO: make rpc call
      return "signed-tx"
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
