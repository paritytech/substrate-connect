/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ToExtension,
  ToApplication,
} from "@substrate/connect-extension-protocol"
import { debug } from "../utils/debug"

const CONTENT_SCRIPT_ORIGIN = "content-script"
const EXTENSION_PROVIDER_ORIGIN = "extension-provider"

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

  #establishNewConnection = ({ chainName, chainId }: ToExtension): void => {
    const port = chrome.runtime.connect({
      name: `${window.location.href}::${chainName}`,
    })

    debug(`CONNECTED ${chainName} PORT`, port)

    // forward any messages: extension -> page
    port.onMessage.addListener((data): void => {
      const { type, payload } = data
      debug(`RECEIVED MESSAGE FROM ${chainName} PORT`, data)
      sendMessage({
        type,
        payload,
        origin: CONTENT_SCRIPT_ORIGIN,
      })
    })

    // tell the page when the port disconnects
    port.onDisconnect.addListener(() => {
      sendMessage({
        origin: "content-script",
        type: "error",
        payload: "Lost communication with substrate-connect extension",
      })
      delete this.#ports[chainId]
    })

    this.#ports[chainId] = port
    debug(`CONNECTED TO ${chainName} PORT`)
  }

  #forwardRpcMessage = ({
    chainName,
    chainId,
    type,
    payload,
    parachainPayload,
  }: ToExtension): void => {
    const port = this.#ports[chainId]
    if (!port) {
      // this is probably someone trying to abuse the extension.
      console.warn(
        `App requested to send message to ${chainName} - no port found`,
      )
      return
    }

    const msg = { type, payload, parachainPayload }

    debug(`SENDING RPC MESSAGE TO ${chainName} PORT`, msg)
    port.postMessage(msg)
  }

  #handleMessage = (msg: MessageEvent<ToExtension>): void => {
    const data = msg.data
    const { origin, type } = data
    if (!origin || origin !== EXTENSION_PROVIDER_ORIGIN) {
      return
    }

    debug(`RECEIVED MESSAGE FROM ${EXTENSION_PROVIDER_ORIGIN}`, data)

    if (!type) {
      // probably someone abusing the extension
      console.warn("Malformed message - missing message.type", data)
      return
    }

    if (type === "spec") this.#establishNewConnection(data)

    if (type === "rpc" || type === "spec") {
      return this.#forwardRpcMessage(data)
    }

    // probably someone abusing the extension
    return console.warn("Malformed message - unrecognised message.type", data)
  }
}
