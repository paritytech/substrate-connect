import { DOM_ELEMENT_ID } from "@substrate/connect-extension-protocol"
import {
  type PIP0001ProviderDetail,
  getLightClientProvider,
} from "@substrate/light-client-extension-helpers/web-page"

const PROVIDER_INFO = {
  uuid: crypto.randomUUID(),
  name: "Substrate Connect",
  // TODO: revisit icon
  icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>",
  // TODO: revisit rdns
  rdns: "io.github.paritytech.SubstrateConnect",
}

const detail: PIP0001ProviderDetail = Object.freeze({
  info: PROVIDER_INFO,
  provider: getLightClientProvider(DOM_ELEMENT_ID),
})

window.addEventListener(
  "pip0001:requestProvider",
  ({ detail: { onProvider } }) => onProvider(detail),
)

window.dispatchEvent(
  new CustomEvent("pip0001:announceProvider", {
    detail,
  }),
)
