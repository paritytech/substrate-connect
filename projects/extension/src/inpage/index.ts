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
  rdns: "io.github.paritytech.substrate-connect",
}

const providerPromise = getLightClientProvider(DOM_ELEMENT_ID)

const announceProvider = async () =>
  window.dispatchEvent(
    new CustomEvent<PIP6963ProviderDetail>("pip6963:announceProvider", {
      detail: Object.freeze({
        info: PROVIDER_INFO,
        provider: await providerPromise,
      }),
    }),
  )

window.addEventListener("pip6963:requestProvider", announceProvider)

announceProvider()
