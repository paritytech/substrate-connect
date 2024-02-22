import { DOM_ELEMENT_ID } from "@substrate/connect-extension-protocol"
import {
  type LightClientProviderDetail,
  getLightClientProvider,
} from "@substrate/light-client-extension-helpers/web-page"

const PROVIDER_INFO = {
  uuid: crypto.randomUUID(),
  name: "Substrate Connect Light Client",
  icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>",
  rdns: "io.github.paritytech.SubstrateConnectLightClient",
}

const detail: LightClientProviderDetail = Object.freeze({
  info: PROVIDER_INFO,
  provider: getLightClientProvider(DOM_ELEMENT_ID),
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
