import { ExtensionMessageHandler } from "./ExtensionMessageHandler"
import { DOM_ELEMENT_ID } from "@substrate/connect-extension-protocol"
import { ToExtension } from "../background/protocol"

// The extension can detect when a tab is closed, but it can't properly detect when a tab is
// reloaded or changes URL or similar. For that reason, we send from the content script a message
// indicating that the state of that content script has been reset.
const tabResetResponseRx = new Promise((resolve: (val: undefined) => void) => {
  chrome.runtime.sendMessage({ type: "tab-reset" } as ToExtension, () =>
    resolve(undefined),
  )
})

const router = new ExtensionMessageHandler(tabResetResponseRx)

// inject as soon as possible the DOM element necessary for web pages to know that the extension
// is available
window.document.addEventListener("readystatechange", () => {
  if (window.document.readyState === "interactive") {
    // If there is already a DOM element inject, don't create another element and don't listen.
    // This way, if multiple extensions are installed, only one will actually be active on any
    // given page.
    if (document.getElementById(DOM_ELEMENT_ID) !== null) return

    const s = document.createElement("span")
    s.id = DOM_ELEMENT_ID
    s.setAttribute("style", "display:none")
    document.body.appendChild(s)
    router.listen()
  }
})
