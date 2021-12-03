/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  MessageToManager,
  ProviderMessage,
  extension,
} from "@substrate/connect-extension-protocol"
import { debug } from "../utils/debug"

const CONTENT_SCRIPT_ORIGIN = "content-script"
const EXTENSION_PROVIDER_ORIGIN = "extension-provider"

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
    extension.listen(this.#handleMessage)
  }

  /** stop stops listening for messages sent by apps.  */
  stop(): void {
    window.removeEventListener("message", this.#handleMessage)
  }

  #establishNewConnection = ({ data }: ProviderMessage): void => {
    const { chainName, chainId, appName, message } = data
    const port = chrome.runtime.connect({
      name: `${appName}::${chainName}`,
    })
    debug(`CONNECTED ${chainName} PORT`, port)

    // forward any messages: extension -> page
    port.onMessage.addListener((data): void => {
      debug(`RECEIVED MESSAGE FROM ${chainName} PORT`, data)
      extension.send({
        uniqueId: chainId,
        message: data,
        origin: CONTENT_SCRIPT_ORIGIN,
      })
    })

    // tell the page when the port disconnects
    port.onDisconnect.addListener(() => {
      extension.send({
        uniqueId: chainId,
        origin: "content-script",
        disconnect: true,
      })
      delete this.#ports[chainId]
    })

    this.#ports[chainId] = port
    debug(`CONNECTED TO ${chainName} PORT`, message)
  }

  #forwardRpcMessage = ({ data }: ProviderMessage): void => {
    const { chainName, chainId, message } = data
    const port = this.#ports[chainId]
    if (!port) {
      // this is probably someone trying to abuse the extension.
      console.warn(
        `App requested to send message to ${chainName} - no port found`,
      )
      return
    }

    debug(`SENDING RPC MESSAGE TO ${chainName} PORT`, message)
    port.postMessage(message)
  }

  #disconnectPort = ({ data }: ProviderMessage): void => {
    const { chainName, chainId } = data
    const port = this.#ports[chainId]

    if (!port) {
      // probably someone trying to abuse the extension.
      console.warn(`App requested to disconnect ${chainName} - no port found`)
      return
    }

    port.disconnect()
    debug(`DISCONNECTED ${chainName} PORT`, port)
    delete this.#ports[chainId]
    return
  }

  #handleMessage = (msg: ProviderMessage): void => {
    const data = msg.data
    const { origin, action, message } = data
    if (!origin || origin !== EXTENSION_PROVIDER_ORIGIN) {
      return
    }

    debug(`RECEIVED MESSAGE FROM ${EXTENSION_PROVIDER_ORIGIN}`, data)

    if (!action) {
      return console.warn("Malformed message - missing action", msg)
    }

    if (action === "connect") {
      return this.#establishNewConnection(msg)
    }

    if (action === "disconnect") {
      return this.#disconnectPort(msg)
    }

    if (action === "forward") {
      const innerMessage = message as MessageToManager
      if (!innerMessage.type) {
        // probably someone abusing the extension
        console.warn("Malformed message - missing message.type", data)
        return
      }

      if (innerMessage.type === "rpc" || innerMessage.type === "spec") {
        return this.#forwardRpcMessage(msg)
      }

      // probably someone abusing the extension
      return console.warn("Malformed message - unrecognised message.type", data)
    }

    // probably someone abusing the extension
    return console.warn("Malformed message - unrecognised action", data)
  }
}
