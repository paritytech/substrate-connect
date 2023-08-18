import {
  DOM_ELEMENT_ID,
  ToApplication,
} from "@substrate/connect-extension-protocol"

import checkMessage from "./checkMessage"
import { PORTS } from "../shared"

// Set up a promise for when the page is activated,
// which is needed for prerendered pages.
const whenActivated = new Promise<void>((resolve) => {
  // @ts-ignore
  if (document.prerendering) {
    // @ts-ignore
    document.addEventListener("prerenderingchange", resolve)
  } else {
    resolve()
  }
})

// inject as soon as possible the DOM element necessary for web pages to know that the extension
// is available
window.document.addEventListener("readystatechange", () => {
  if (window.document.readyState !== "interactive") return

  // If there is already a DOM element inject, don't create another element and don't listen.
  // This way, if multiple extensions are installed, only one will actually be active on any
  // given page.
  if (document.getElementById(DOM_ELEMENT_ID) !== null) return

  const s = document.createElement("span")
  s.id = DOM_ELEMENT_ID
  s.setAttribute("style", "display:none")
  document.body.appendChild(s)

  let port: chrome.runtime.Port | undefined

  window.addEventListener("message", async ({ data, source, origin }) => {
    if (source !== window) return
    if (data?.origin !== "substrate-connect-client") return
    if (!checkMessage(data)) {
      // probably someone abusing the extension
      console.warn("Malformed message - unrecognised message.type", data)
      return
    }

    await whenActivated

    if (!port) {
      port = chrome.runtime.connect({ name: PORTS.CONTENT })
      port.onMessage.addListener((msg: ToApplication) =>
        window.postMessage(msg, origin),
      )
    }

    port.postMessage(data)
  })
})
