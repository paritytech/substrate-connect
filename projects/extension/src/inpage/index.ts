import { DOM_ELEMENT_ID } from "@substrate/connect-extension-protocol"
import {
  type LightClientProviderDetail,
  getLightClientProvider,
} from "@substrate/light-client-extension-helpers/web-page"
import { createRpc } from "../shared"

const PROVIDER_INFO = {
  uuid: crypto.randomUUID(),
  name: "Substrate Connect Light Client",
  icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>",
  rdns: "io.github.paritytech.SubstrateConnectLightClient",
}

const toyRpc = createRpc((msg) =>
  // origin is needed to filter from other postMessages
  window.postMessage({ origin: "template-extesion/web", msg }),
)
window.addEventListener("message", ({ data }) => {
  if (data.origin !== "template-extesion/extension") return
  toyRpc.handle(data.msg, undefined)
})

const detail: LightClientProviderDetail = Object.freeze({
  info: PROVIDER_INFO,
  provider: getLightClientProvider(DOM_ELEMENT_ID),
  // TODO: remove, exposed for demo purposes
  // It should be removed because this is an internal implementation detail
  rpcRequest: toyRpc.request,
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
