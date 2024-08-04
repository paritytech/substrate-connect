import { register } from "@substrate/light-client-extension-helpers/content-script"
import type { ToContent } from "./protocol"

register("extension-unique-id")

// TODO: inpage script might not be needed
try {
  const s = document.createElement("script")
  s.type = "module"
  s.src = chrome.runtime.getURL("js/inpage.global.js")
  s.onload = function () {
    // @ts-ignore
    this.remove()
  }
  ;(document.head || document.documentElement).appendChild(s)
} catch (error) {
  console.error("error injecting js/inpage.global.js", error)
}

chrome.runtime.onMessage.addListener((msg: ToContent, sender, sendResponse) => {
  if (
    !sender.tab &&
    msg.origin === "my-extension-background" &&
    msg.type === "onAddChainByUser"
  ) {
    sendResponse(confirm(`Confirm addChain ${JSON.stringify(msg.inputChain)}?`))
  }
})
