/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  Client,
  healthChecker as smHealthChecker,
  Chain,
} from "@substrate/smoldot-light"
import { JsonRpcCallback, SmoldotHealth } from "@substrate/smoldot-light"
import { ExposedChainConnection, ChainConnection } from "./types"
import EventEmitter from "eventemitter3"
import { StateEmitter } from "./types"
import { logger } from "@polkadot/util"
import { ToExtension } from "@substrate/connect-extension-protocol"
import westend from "../../public/assets/westend.json"
import kusama from "../../public/assets/kusama.json"
import polkadot from "../../public/assets/polkadot.json"
import rococo from "../../public/assets/rococo.json"

export const wellKnownChains: Map<string, string> = new Map<string, string>([
  ["polkadot", JSON.stringify(polkadot)],
  ["kusama", JSON.stringify(kusama)],
  ["rococo", JSON.stringify(rococo)],
  ["westend", JSON.stringify(westend)],
])

const l = logger("Extension Connection Manager")

/**
 * ConnectionManager is the main class involved in managing connections from
 * content-script.  It keeps track of active chain connections and it is also
 * responsible for triggering events when the state changes for the UI to update
 * accordingly.
 */
export class ConnectionManager extends (EventEmitter as {
  new (): StateEmitter
}) {
  #client: Client | null
  #emitScheduled = false
  readonly #chainConnections: Map<string, ChainConnection> = new Map()

  constructor(client: Client) {
    super()
    this.#client = client
  }

  /**
   *
   *
   * @returns all the connected chains.
   */
  get connections(): ExposedChainConnection[] {
    return [...this.#chainConnections.values()]
      .filter((a) => a.chainName)
      .map((a: ChainConnection) => ({
        chainId: a.chainId,
        url: a.url,
        tabId: a.tabId,
        chainName: a.chainName,
        healthStatus: a.healthStatus,
      }))
  }

  #emitStateChanged() {
    // let's make sure that we don't unnecessary spam the UI with notifications
    if (this.#emitScheduled) return

    this.#emitScheduled = true
    setTimeout(() => {
      this.emit("stateChanged", this.connections)
      this.#emitScheduled = false
    }, 0)
  }

  /**
   * disconnectTab disconnects all chains connected
   * from the supplied tabId
   *
   * @param tabId - the id of the tab to disconnect
   */
  disconnectTab(tabId: number): void {
    this.#chainConnections.forEach((a) => {
      if (a.tabId === tabId) a.port.disconnect()
    })
  }

  /**
   * addChainConnection registers a new chain-connection to be tracked by the background.
   *
   * @param port - a port for a fresh connection that was made to the background
   * by a content script.
   */
  addChainConnection(port: chrome.runtime.Port): void {
    if (!this.#client) {
      throw new Error("Smoldot client does not exist.")
    }

    // if create an `AppMediator` throws, it has sent an error down the
    // port and disconnected it, so we should just ignore
    try {
      const { name: chainId, sender } = port
      const tabId: number = sender!.tab!.id!
      const url: string = sender!.url!
      const pendingRequests: string[] = []

      const healthChecker = smHealthChecker()
      const connection: ChainConnection = {
        chainName: "",
        chainId,
        tabId,
        url,
        port,
        healthChecker,
        pendingRequests,
      }

      const onMessageHandler = (msg: ToExtension) => {
        this.#handleMessage(msg, connection)
      }
      port.onMessage.addListener(onMessageHandler)

      const onDisconnect = () => {
        connection.chain && connection.chain.remove()
        connection.parachain && connection.parachain.remove()

        port.onMessage.removeListener(onMessageHandler)
        port.onDisconnect.removeListener(onDisconnect)

        if (this.#chainConnections.get(chainId)?.chainName)
          this.#emitStateChanged()

        this.#chainConnections.delete(chainId)
      }
      port.onDisconnect.addListener(onDisconnect)

      this.#chainConnections.set(chainId, connection)
    } catch (e) {
      const msg = `Error while connecting to the port ${e}`
      l.error(msg)
      this.#handleError(port, e instanceof Error ? e : new Error(msg))
    }
  }

  /** shutdown shuts down the connected smoldot client. */
  shutdown(): Promise<void> {
    if (!this.#client) return Promise.resolve()

    this.#chainConnections.forEach((a) => a.port.disconnect())
    const client = this.#client
    this.#client = null
    return client.terminate()
  }

  /**
   * addChain adds the Chain in the smoldot client
   *
   * @param spec - ChainSpec of chain to be added
   * @param jsonRpcCallback - The jsonRpcCallback function that should be triggered
   * @param relayChain - optional Smoldot's Chain for relay chain
   *
   * @returns addedChain - An the newly added chain info
   */
  addChain(
    chainSpec: string,
    jsonRpcCallback?: JsonRpcCallback,
    tabId?: number,
  ): Promise<Chain> {
    if (!this.#client) {
      throw new Error("Smoldot client does not exist.")
    }

    const potentialRelayChains = [...this.#chainConnections.values()]
      .filter((c) => c.tabId === tabId && !c.parachain && c.chain)
      .map((c) => c.chain!)

    return this.#client.addChain({
      chainSpec,
      jsonRpcCallback,
      potentialRelayChains,
    })
  }

  #handleError(port: chrome.runtime.Port, e: Error) {
    port.postMessage({ type: "error", payload: e.message })
    port.disconnect()
  }

  /** Handles the incoming message that contains Spec. */
  async #handleSpecMessage(
    chainConnection: ChainConnection,
    relayChainSpec: string,
    parachainSpec?: string,
  ) {
    if (!relayChainSpec) {
      throw new Error("Relay chain spec was not found")
    }

    const rpcCallback = (rpc: string) => {
      const rpcResp = chainConnection.healthChecker.responsePassThrough(rpc)
      if (rpcResp)
        chainConnection.port.postMessage({ type: "rpc", payload: rpcResp })
    }

    let chainPromise: Promise<{ chain: Chain; parachain?: Chain }>
    // Means this is a parachain trying to connect
    if (parachainSpec) {
      chainConnection.chainName = JSON.parse(parachainSpec).name || "unknown"
      // Connect the main Chain first and on success the parachain with the chain
      // that just got connected as the relayChain
      chainPromise = this.addChain(
        relayChainSpec,
        undefined,
        chainConnection.tabId,
      ).then((chain) =>
        this.addChain(parachainSpec, rpcCallback, chainConnection.tabId).then(
          (parachain) => ({ chain, parachain }),
        ),
      )
    } else {
      chainConnection.chainName = JSON.parse(relayChainSpec).name || "unknown"
      // Connect the main Chain only
      chainPromise = this.addChain(
        relayChainSpec,
        rpcCallback,
        chainConnection.tabId,
      ).then((chain) => ({ chain }))
    }

    chainConnection.chainName = chainConnection.chainName.toLowerCase()

    this.#emitStateChanged()

    chrome.storage.sync.get("notifications", (s) => {
      s.notifications &&
        chrome.notifications.create(chainConnection.port.name, {
          title: "Substrate Connect",
          message: `Chain ${chainConnection.chainId} connected to ${chainConnection.chainName}.`,
          iconUrl: "./icons/icon-32.png",
          type: "basic",
        })
    })

    const { chain, parachain } = await chainPromise
    chainConnection.chain = chain
    chainConnection.parachain = parachain

    // Initialize healthChecker
    const sender = chainConnection.parachain
      ? chainConnection.parachain
      : chainConnection.chain

    chainConnection.healthChecker.setSendJsonRpc(
      sender.sendJsonRpc.bind(sender),
    )
    chainConnection.healthChecker.start((health: SmoldotHealth) => {
      const hasChanged =
        chainConnection.healthStatus?.peers !== health.peers ||
        chainConnection.healthStatus.isSyncing !== health.isSyncing ||
        chainConnection.healthStatus.shouldHavePeers !== health.shouldHavePeers

      chainConnection.healthStatus = health
      if (hasChanged) this.emit("stateChanged", this.connections)
    })

    // process any RPC requests that came in while waiting for `addChain` to complete
    chainConnection.pendingRequests.forEach((req) =>
      chainConnection.healthChecker.sendJsonRpc(req),
    )
    chainConnection.pendingRequests = []
  }

  #handleMessage(msg: ToExtension, chainConnection: ChainConnection): void {
    if (
      (msg.type !== "rpc" &&
        msg.type !== "add-chain" &&
        msg.type !== "add-well-known-chain") ||
      !msg.payload
    ) {
      const errorMsg = `Unrecognised message type '${msg.type}' or payload '${msg.payload}' received from content script`
      l.error(errorMsg)
      return this.#handleError(chainConnection.port, new Error(errorMsg))
    }

    if (msg.type === "rpc") {
      chainConnection.chain
        ? chainConnection.healthChecker.sendJsonRpc(msg.payload)
        : // `addChain` hasn't resolved yet after the spec message so buffer the
          // messages to be sent when it does resolve
          chainConnection.pendingRequests.push(msg.payload)
      return
    }

    const chainSpec =
      msg.type === "add-chain"
        ? msg.payload
        : wellKnownChains.get(msg.payload) ?? ""

    this.#handleSpecMessage(
      chainConnection,
      chainSpec,
      msg.parachainPayload,
    ).catch((e) => {
      const errorMsg = `An error happened while adding the chain ${e}`
      l.error(errorMsg)
      this.#handleError(
        chainConnection.port,
        e instanceof Error ? e : new Error(errorMsg),
      )
    })
  }
}
