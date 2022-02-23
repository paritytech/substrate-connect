import { ToApplication } from "@substrate/connect-extension-protocol"
import { debug } from "../utils/debug"
import checkMessage from "./checkMessage"

const EXTENSION_PROVIDER_ORIGIN = "substrate-connect-client"

const sendMessage = (msg: ToApplication): void => {
  window.postMessage(msg, "*")
}

/* ExtensionMessageRouter is the part of the content script that listens for
 * messages that the ExtensionProvider in an app sends using `window.postMessage`.
 * It establishes a connection to the extension background on behalf of the app,
 * and forwards RPC requests for the app to the extension background.
 *
 * Conversely it listens for messages sent through the port from the extension
 * background and forwards them to the app via `window.postMessage`
 *
 * This router exists because the app does not have access to the chrome APIs
 * to establish the connection with the background itself.
 */
export class ExtensionMessageRouter {
  #port: chrome.runtime.Port = chrome.runtime.connect()
  #chainIds: Set<string> = new Set()

  constructor() {
    // forward any messages: extension -> page
    this.#port.onMessage.addListener((data: ToApplication): void => {
      if (data.type == "error") this.#chainIds.delete(data.chainId)

      sendMessage(data)
    })

    // tell the page when the port disconnects
    this.#port.onDisconnect.addListener(() => {
      this.#chainIds.forEach((chainId) => {
        sendMessage({
          origin: "substrate-connect-extension",
          chainId,
          type: "error",
          errorMessage: "Lost communication with substrate-connect extension",
        })
      })

      this.#chainIds.clear()
    })
  }

  /**
   * connections returns the names of all the ports this `ExtensionMessageRouter`
   * is managing for the app.
   *
   * @returns A list of strings
   */
  get connections(): string[] {
    return [...this.#chainIds.keys()]
  }

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

    debug(`RECEIVED MESSAGE FROM ${EXTENSION_PROVIDER_ORIGIN}`, data)

    if (!checkMessage(data)) {
      // probably someone abusing the extension
      console.warn("Malformed message - unrecognised message.type", data)
      return
    }

    if (data.type === "add-well-known-chain" || data.type === "add-chain") {
      this.#chainIds.add(data.chainId)
    }

    if (data.type === "remove-chain") this.#chainIds.delete(data.chainId)

    this.#port.postMessage(data)
  }
}
