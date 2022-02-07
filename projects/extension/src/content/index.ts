import { ExtensionMessageRouter } from "./ExtensionMessageRouter"
import { debug } from "../utils/debug"
import { DOM_ELEMENT_ID } from "@substrate/connect-extension-protocol"

debug("EXTENSION CONTENT SCRIPT RUNNING")

// inject as soon as possible the DOM element necessary for web pages to know that the extension
// is available
window.document.addEventListener("readystatechange", () => {
  debug("READYSTATE CHANGED")
  if (window.document.readyState === "interactive") {
    debug("INJECTING EXTENSION SPAN")

    const s = document.createElement("span")
    s.id = DOM_ELEMENT_ID
    s.setAttribute("style", "display:none")
    document.body.appendChild(s)
  }
})

const router = new ExtensionMessageRouter()
router.listen()
