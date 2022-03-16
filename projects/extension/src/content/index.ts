import { ExtensionMessageRouter } from "./ExtensionMessageRouter"
import { DOM_ELEMENT_ID } from "@substrate/connect-extension-protocol"

// inject as soon as possible the DOM element necessary for web pages to know that the extension
// is available
window.document.addEventListener("readystatechange", () => {
  if (window.document.readyState === "interactive") {
    const s = document.createElement("span")
    s.id = DOM_ELEMENT_ID
    s.setAttribute("style", "display:none")
    document.body.appendChild(s)
  }
})

const router = new ExtensionMessageRouter()
router.listen()
