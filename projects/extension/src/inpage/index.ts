import { DOM_ELEMENT_ID } from "@substrate/connect-extension-protocol"
import {
  type LightClientProviderDetail,
  getLightClientProvider,
} from "@substrate/light-client-extension-helpers/web-page"
import "@substrate/discovery"
import type { SmoldotExtensionProviderDetail } from "@substrate/smoldot-discovery/types"
import { createScClient } from "./connector"

const PROVIDER_INFO = {
  uuid: crypto.randomUUID(),
  name: "Substrate Connect Light Client",
  icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>",
  rdns: "io.github.paritytech.SubstrateConnectLightClient",
}

const lightClientProvider = getLightClientProvider(DOM_ELEMENT_ID)
const smoldotV1Provider = lightClientProvider.then(createScClient)

registerSubstrateConnect()
registerSubstrateConnectOld()

/**
 * Support the latest version Substrate Connect where the @substrate/discovery
 * protocol is being used.
 */
function registerSubstrateConnect() {
  const detail: SmoldotExtensionProviderDetail = Object.freeze({
    kind: "smoldot-v1",
    info: PROVIDER_INFO,
    provider: smoldotV1Provider,
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
    provider: lightClientProvider,
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
