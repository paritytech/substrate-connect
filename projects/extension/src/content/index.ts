import { register } from "@substrate/light-client-extension-helpers/content-script"
import { DOM_ELEMENT_ID } from "@substrate/connect-extension-protocol"

window.addEventListener("message", ({ source, origin, data }: MessageEvent) => {
  if (
    source !== window ||
    origin !== window.origin ||
    typeof data !== "object" ||
    data.origin !== "substrate-connect-client" ||
    data.type !== "is-extension-present"
  )
    return
  window.postMessage({
    origin: "substrate-connect-extension",
    type: "is-extension-present",
  })
})

register(DOM_ELEMENT_ID)
