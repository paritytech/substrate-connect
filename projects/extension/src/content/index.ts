import { register } from "@polkadot-api/light-client-extension-helpers/content-script"
import { DOM_ELEMENT_ID } from "@substrate/connect-extension-protocol"

register(DOM_ELEMENT_ID)

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
  s.setAttribute("channelid", DOM_ELEMENT_ID)
  document.body.appendChild(s)
})
