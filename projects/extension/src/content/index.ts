import { register } from "@substrate/light-client-extension-helpers/content-script"
import { DOM_ELEMENT_ID } from "@substrate/connect-extension-protocol"

try {
  const s = document.createElement("script")
  s.type = "module"
  s.src = chrome.runtime.getURL("inpage/inpage.js")
  s.onload = () => s.remove()
  ;(document.head || document.documentElement).appendChild(s)
} catch (error) {
  console.error("error injecting inpage/inpage.js", error)
}

register(DOM_ELEMENT_ID)
