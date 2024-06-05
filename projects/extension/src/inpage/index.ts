import { DOM_ELEMENT_ID } from "@substrate/connect-extension-protocol"
import {
  type LightClientProviderDetail,
  getLightClientProvider,
} from "@substrate/light-client-extension-helpers/web-page"
import "@substrate/discovery"
import type { Unstable } from "@substrate/connect-discovery"

const PROVIDER_INFO = {
  uuid: crypto.randomUUID(),
  name: "Substrate Connect Light Client",
  icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>",
  rdns: "io.github.paritytech.SubstrateConnectLightClient",
}

const provider = getLightClientProvider(DOM_ELEMENT_ID).then(
  (lightClientProvider) => ({
    ...lightClientProvider,
    async getAccounts() {
      throw new Error("unsupported method: getAccounts")
    },
    async createTx() {
      throw new Error("unsupported method: createTx")
    },
  }),
)

registerSubstrateConnect()
registerSubstrateConnectOld()

/**
 * Support the latest version Substrate Connect where the @substrate/discovery
 * protocol is being used.
 */
function registerSubstrateConnect() {
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
}

/**
 * Support Substrate Connect <1 where the "lightClient:requestProvider"
 * was being used
 */
function registerSubstrateConnectOld() {
  const detail: LightClientProviderDetail = Object.freeze({
    info: PROVIDER_INFO,
    provider,
  })
  window.addEventListener(
    "lightClient:requestProvider",
    ({ detail: { onProvider } }) => onProvider(detail),
  )

  window.dispatchEvent(
    new CustomEvent("lightClient:announceProvider", {
      detail,
    }),
  )
}
