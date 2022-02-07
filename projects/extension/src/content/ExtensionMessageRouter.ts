/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable no-empty */
import {
  ToExtension,
  ToApplication,
} from "@substrate/connect-extension-protocol"
import { debug } from "../utils/debug"
import checkMessage from "./checkMessage"

const CONTENT_SCRIPT_ORIGIN = "substrate-connect-extension"
const EXTENSION_PROVIDER_ORIGIN = "substrate-connect-client"

const sendMessage = (msg: ToApplication): void => {
  window.postMessage(msg, "*")
}

/* ExtensionMessageRouter is the part of the content script that listens for
 * messages that the ExtensionProvider in an app sends using `window.postMessage`.
 * It establishes connections to the extension background on behalf of the app,
 * forwards RPC requests for the app to the extension background and disconnects
 * the port when the app requests it.
 *
 * Conversely it listens for messages sent through the port from the extension
 * background and forwards them to the app via `window.postMessage`
 *
 * This router exists because the app does not have access to the chrome APIs
 * to establish the connection with the background itself.
 */
export class ExtensionMessageRouter {
  #ports: Record<string, chrome.runtime.Port> = {}

  /**
   * connections returns the names of all the ports this `ExtensionMessageRouter`
   * is managing for the app.
   *
   * @returns A list of strings
   */
  get connections(): string[] {
    return Object.keys(this.#ports)
  }

  /** listen starts listening for messages sent by an app.  */
  listen(): void {
    window.addEventListener("message", this.#handleMessage)
  }

  /** stop stops listening for messages sent by apps.  */
  stop(): void {
    window.removeEventListener("message", this.#handleMessage)
  }

  #establishNewConnection = (chainId: string): void => {
    const port = chrome.runtime.connect({ name: chainId })

    debug(`CONNECTED ${chainId} PORT`, port)

    // forward any messages: extension -> page
    port.onMessage.addListener((data): void => {
      debug(`RECEIVED MESSAGE FROM ${chainId} PORT`, data)
      const msg = {
        ...data,
        chainId,
        origin: CONTENT_SCRIPT_ORIGIN,
      }

      // Because the construction of the message is hacky, we have no choice but to  cast
      // to `unknown`. This is expected to be fixed in a later refactor.
      sendMessage(msg as unknown as ToApplication)
    })

    // tell the page when the port disconnects
    port.onDisconnect.addListener(() => {
      sendMessage({
        origin: "substrate-connect-extension",
        chainId,
        type: "error",
        errorMessage: "Lost communication with substrate-connect extension",
      })
      delete this.#ports[chainId]
    })

    this.#ports[chainId] = port
    debug(`CONNECTED TO ${chainId} PORT`)
  }

  #handleMessage = (msg: MessageEvent<ToExtension>): void => {
    const data = msg.data
    const { origin, type } = data
    if (!origin || origin !== EXTENSION_PROVIDER_ORIGIN) {
      return
    }

    debug(`RECEIVED MESSAGE FROM ${EXTENSION_PROVIDER_ORIGIN}`, data)

    if (!checkMessage(data)) {
      // probably someone abusing the extension
      console.warn("Malformed message - unrecognised message.type", data)
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { chainId, origin: _, ...forwardMsg } = data
    if (type === "add-well-known-chain" || type === "add-chain") {
      this.#establishNewConnection(chainId)
    }

    const port = this.#ports[chainId]
    if (!port) {
      // this is probably someone trying to abuse the extension.
      console.warn(
        `App requested to send message to ${chainId} - no port found`,
      )
      return
    }

    debug(`SENDING RPC MESSAGE TO ${chainId} PORT`, msg)
    port.postMessage(forwardMsg)
  }
}
