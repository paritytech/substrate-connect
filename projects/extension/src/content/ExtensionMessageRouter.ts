/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  extension,
  ToExtension,
  ToExtensionMessageType,
  ToWebpageMessageType,
  ToWebpageHeader,
  ToWebpageBody,
} from "@substrate/connect-extension-protocol"
import { debug } from "../utils/debug"

const CONTENT_SCRIPT_ORIGIN = "content-script" as const
const EXTENSION_PROVIDER_ORIGIN = "extension-provider" as const

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
  #ports: Map<number, chrome.runtime.Port>

  constructor() {
    this.#ports = new Map()
  }

  /**
   * connections returns the names of all the ports this `ExtensionMessageRouter`
   * is managing for the app.
   *
   * @returns A list of strings
   */
  get connections(): number[] {
    return [...this.#ports.keys()]
  }

  /** listen starts listening for messages sent by an app.  */
  listen(): void {
    extension.listen(this.#handleMessage)
  }

  /** stop stops listening for messages sent by apps.  */
  stop(): void {
    window.removeEventListener("message", this.#handleMessage)
  }

  #establishNewConnection = (
    providerId: number,
    displayName?: string,
  ): void => {
    const name = displayName || providerId.toString(10)
    const port = chrome.runtime.connect({
      name,
    })

    const header: ToWebpageHeader = {
      providerId,
      origin: CONTENT_SCRIPT_ORIGIN,
    }
    // forward any messages: extension -> page
    port.onMessage.addListener((body: ToWebpageBody): void => {
      debug(`RECEIVED MESSAGE FROM ${name} PORT`, body)
      extension.send({ header, body })
    })

    // tell the page when the port disconnects
    port.onDisconnect.addListener(() => {
      extension.send({
        header: header,
        body: { type: ToWebpageMessageType.Disconnect },
      })
      this.#ports.delete(providerId)
    })

    this.#ports.set(providerId, port)
    debug(`CONNECTED ${name} PORT`, port)
  }

  #forwardRpcMessage = (message: ToExtension): void => {
    const providerId = message.header.providerId
    const port = this.#ports.get(providerId)
    if (!port) {
      // this is probably someone trying to abuse the extension.
      console.warn(
        `App requested to send message to ${providerId} - no port found`,
      )
      return
    }

    debug(`SENDING RPC MESSAGE TO ${port.name} PORT`, message)
    port.postMessage(message.body)
  }

  #disconnectPort = (providerId: number): void => {
    const port = this.#ports.get(providerId)

    if (!port) {
      // probably someone trying to abuse the extension.
      console.warn(`App requested to disconnect ${providerId} - no port found`)
      return
    }

    port.disconnect()
    debug(`DISCONNECTED ${port.name} PORT`, port)
    this.#ports.delete(providerId)
  }

  #handleMessage = ({ data: message }: MessageEvent<ToExtension>): void => {
    if (message?.header?.origin !== EXTENSION_PROVIDER_ORIGIN) {
      return
    }

    debug(`RECEIVED MESSAGE FROM ${EXTENSION_PROVIDER_ORIGIN}`, message)

    const { body, header } = message
    if (body.type === ToExtensionMessageType.Connect) {
      return this.#establishNewConnection(
        header.providerId,
        body.payload.displayName,
      )
    }

    if (body.type === ToExtensionMessageType.Disconnect) {
      return this.#disconnectPort(header.providerId)
    }

    return this.#forwardRpcMessage(message)
  }
}
