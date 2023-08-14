import checkMessage from "./checkMessage"

const EXTENSION_PROVIDER_ORIGIN = "substrate-connect-client"

export class ExtensionMessageHandler {
  /** listen starts listening for messages sent by an app.  */
  listen(): void {
    window.addEventListener("message", this.#handleMessage)
  }

  /** stop stops listening for messages sent by apps.  */
  stop(): void {
    window.removeEventListener("message", this.#handleMessage)
  }

  #handleMessage = (msg: MessageEvent): void => {
    const data = msg.data
    if (!data.origin || data.origin !== EXTENSION_PROVIDER_ORIGIN) {
      return
    }

    if (!checkMessage(data)) {
      // probably someone abusing the extension
      console.warn("Malformed message - unrecognised message.type", data)
      return
    }

    chrome.runtime.sendMessage(data)
  }
}
