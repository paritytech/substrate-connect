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

try {
  const s = document.createElement("script")
  s.src = chrome.runtime.getURL("inpage/inpage.js")
  s.onload = () => s.remove()
  ;(document.head || document.documentElement).appendChild(s)
} catch (error) {
  console.error("error injecting inpage/inpage.js", error)
}

register(DOM_ELEMENT_ID)
