import { DOM_ELEMENT_ID } from "@substrate/connect-extension-protocol"
import {
  type PIP6963ProviderDetail,
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

const detail: PIP6963ProviderDetail = Object.freeze({
  info: PROVIDER_INFO,
  provider: getLightClientProvider(DOM_ELEMENT_ID),
})

window.addEventListener(
  "pip6963:requestProvider",
  ({ detail: { onProvider } }) => onProvider(detail),
)

window.dispatchEvent(
  new CustomEvent("pip6963:announceProvider", {
    detail,
  }),
)
