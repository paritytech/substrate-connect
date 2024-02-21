import { register } from "@substrate/light-client-extension-helpers/content-script"
import { DOM_ELEMENT_ID } from "@substrate/connect-extension-protocol"

try {
  const s = document.createElement("script")
  s.src = chrome.runtime.getURL("inpage/inpage.js")
  s.onload = () => s.remove()
  ;(document.head || document.documentElement).appendChild(s)
} catch (error) {
  console.error("error injecting inpage/inpage.js", error)
}

register(DOM_ELEMENT_ID)

// ContentScript RPC endpoint
// const rpc = createRpc(
//   (msg) => window.postMessage({ origin: "extension", msg }),
//   {
//     ping() {
//       return "pong from content-script"
//     },
//   },
// )
// window.addEventListener("message", (ev) => {
//   if (ev.data.origin !== "web") return
//   console.log("[content-script] handle", ev.data)
//   rpc.handle(ev.data.msg, {})
// })

// Relay message to BackgroundScript
const port = chrome.runtime.connect({ name: "extension-template" })
port.onMessage.addListener((msg) =>
  // origin is needed to filter from other postMessages
  window.postMessage({ origin: "template-extesion/extension", msg }),
)
window.addEventListener("message", ({ data }) => {
  if (data.origin !== "template-extesion/web") return
  port.postMessage(data.msg)
})
