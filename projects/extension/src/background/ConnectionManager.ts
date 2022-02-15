/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Client, Chain } from "@substrate/smoldot-light"
import {
  healthChecker as smHealthChecker,
  WellKnownChains,
  SmoldotHealth,
  JsonRpcCallback,
} from "@substrate/connect"

import { ExposedChainConnection, ChainConnection } from "./types"
import EventEmitter from "eventemitter3"
import { StateEmitter } from "./types"
import { logger } from "@polkadot/util"
import { ToExtension } from "@substrate/connect-extension-protocol"
import westend2 from "../../public/assets/westend2.json"
import ksmcc3 from "../../public/assets/ksmcc3.json"
import polkadot from "../../public/assets/polkadot.json"
import rococo_v2 from "../../public/assets/rococo_v2.json"

export const wellKnownChains: Map<WellKnownChains, string> = new Map<
  WellKnownChains,
  string
>([
  [WellKnownChains.polkadot, JSON.stringify(polkadot)],
  [WellKnownChains.ksmcc3, JSON.stringify(ksmcc3)],
  [WellKnownChains.rococo_v2, JSON.stringify(rococo_v2)],
  [WellKnownChains.westend2, JSON.stringify(westend2)],
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

      const healthChecker = smHealthChecker()
      const id = `${chainId}::${tabId}`
      const connection: ChainConnection = {
        id,
        chainName: "",
        chainId,
        tabId,
        url,
        port,
        healthChecker,
      }

      const onMessageHandler = (msg: ToExtension) => {
        this.#handleMessage(msg, connection)
      }
      port.onMessage.addListener(onMessageHandler)

      const onDisconnect = () => {
        connection.chain && connection.chain.remove()

        port.onMessage.removeListener(onMessageHandler)
        port.onDisconnect.removeListener(onDisconnect)

        if (this.#chainConnections.get(id)?.chainName) this.#emitStateChanged()

        this.#chainConnections.delete(id)
      }
      port.onDisconnect.addListener(onDisconnect)

      this.#chainConnections.set(id, connection)
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
    potentialRelayChainIds: string[],
    jsonRpcCallback?: JsonRpcCallback,
    tabId?: number,
    databaseContent?: string,
  ): Promise<Chain> {
    if (!this.#client) {
      throw new Error("Smoldot client does not exist.")
    }

    const potentialRelayChains = potentialRelayChainIds
      .map(
        (chainId) => this.#chainConnections.get(`${chainId}::${tabId}`)?.chain,
      )
      .filter((chain): chain is Chain => !!chain)

    return this.#client.addChain({
      chainSpec,
      databaseContent,
      jsonRpcCallback,
      potentialRelayChains,
    })
  }

  #handleError(port: chrome.runtime.Port, e: Error) {
    port.postMessage({ type: "error", errorMessage: e.message })
    port.disconnect()
  }

  /** Handles the incoming message that contains Spec. */
  async #handleSpecMessage(
    chainConnection: ChainConnection,
    chainSpec: string,
    potentialRelayChainIds: string[],
  ) {
    if (!chainSpec) {
      throw new Error("Relay chain spec was not found")
    }

    const rpcCallback = (rpc: string) => {
      const rpcResp = chainConnection.healthChecker.responsePassThrough(rpc)
      if (rpcResp)
        chainConnection.port.postMessage({
          type: "rpc",
          jsonRpcMessage: rpcResp,
        })
    }

    chainConnection.chainName =
      JSON.parse(chainSpec).name.toLowerCase() || "unknown"

    const chainPromise: Promise<Chain> = this.addChain(
      chainSpec,
      potentialRelayChainIds,
      rpcCallback,
      chainConnection.tabId,
    )

    this.#emitStateChanged()

    chrome.storage.local.get("notifications", (s) => {
      s.notifications &&
        chrome.notifications.create(chainConnection.port.name, {
          title: "Substrate Connect",
          message: `Chain ${chainConnection.chainId} connected to ${chainConnection.chainName}.`,
          iconUrl: "./icons/icon-32.png",
          type: "basic",
        })
    })

    const chain = await chainPromise

    // it has to be taken into account the fact that it's technically possible
    // -although, quite unlikey- that the port gets closed while we are waiting
    // for smoldot to return the chain. The way to know this is by checking
    // whether this `chainConnection` is still present insinde `#chainConnections`.
    // If it isn't, that means that the port got disconnected, so we should stop.
    if (!this.#chainConnections.has(chainConnection.id)) {
      chain.remove()
      return
    }

    chainConnection.chain = chain
    chainConnection.port.postMessage({ type: "chain-ready" })

    // Initialize healthChecker
    chainConnection.healthChecker.setSendJsonRpc((rpc: string) => {
      chain.sendJsonRpc(rpc)
    })
    chainConnection.healthChecker.start((health: SmoldotHealth) => {
      const hasChanged =
        chainConnection.healthStatus?.peers !== health.peers ||
        chainConnection.healthStatus.isSyncing !== health.isSyncing ||
        chainConnection.healthStatus.shouldHavePeers !== health.shouldHavePeers

      chainConnection.healthStatus = health
      if (hasChanged) this.emit("stateChanged", this.connections)
    })
  }

  #handleMessage(msg: ToExtension, chainConnection: ChainConnection): void {
    if (msg.type === "remove-chain") return chainConnection.port.disconnect()

    if (msg.type === "rpc") {
      if (chainConnection.chain)
        return chainConnection.healthChecker.sendJsonRpc(msg.jsonRpcMessage)

      const errorMsg =
        "RPC request received befor the chain was successfully added"
      l.error(errorMsg)
      this.#handleError(chainConnection.port, new Error(errorMsg))
      return
    }

    const [chainSpec, potentialRelayChainIds]: [string, string[]] =
      msg.type === "add-chain"
        ? [msg.chainSpec, msg.potentialRelayChainIds]
        : [
            wellKnownChains.get(msg.chainName as WellKnownChains)!,
            [] as string[],
          ]

    this.#handleSpecMessage(
      chainConnection,
      chainSpec,
      potentialRelayChainIds,
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
