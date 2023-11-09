import { register } from "@polkadot-api/light-client-extension-helpers/content-script"
import { DOM_ELEMENT_ID } from "@substrate/connect-extension-protocol"

const channelId = getRandomChannelId()

register(channelId)

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

  window.addEventListener("message", async ({ data, source, origin }) => {
    await whenActivated

    if (source !== window) return

    if (!data?.channelId && data?.origin === "substrate-connect-client") {
      window.postMessage({ channelId, msg: data }, origin)
    } else if (
      data?.channelId === channelId &&
      data?.msg?.origin === "substrate-connect-extension"
    ) {
      window.postMessage(data.msg, origin)
    }
  })
})

function getRandomChannelId(): string {
  const arr = new BigUint64Array(2)
  crypto.getRandomValues(arr)
  const result = (arr[1]! << BigInt(64)) | arr[0]!
  return `substrate-connect-extension-${result.toString(36)}`
}
