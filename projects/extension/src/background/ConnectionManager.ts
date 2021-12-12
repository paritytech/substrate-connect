/* eslint-disable @typescript-eslint/unbound-method */
import {
  Client,
  start,
  healthChecker as smHealthChecker,
} from "@substrate/smoldot-light"
import { JsonRpcCallback, SmoldotHealth } from "@substrate/smoldot-light"
import { ExposedAppInfo, App, ConnectionManagerInterface } from "./types"
import EventEmitter from "eventemitter3"
import { StateEmitter, State } from "./types"
import { NetworkMainInfo, Network } from "../types"
import { logger } from "@polkadot/util"
import {
  MessageFromManager,
  MessageToManager,
} from "@substrate/connect-extension-protocol"
import westend from "../../public/assets/westend.json"
import kusama from "../../public/assets/kusama.json"
import polkadot from "../../public/assets/polkadot.json"
import rococo from "../../public/assets/rococo.json"

type RelayType = Map<string, string>

const relayChains: RelayType = new Map<string, string>([
  ["polkadot", JSON.stringify(polkadot)],
  ["ksmcc3", JSON.stringify(kusama)],
  ["rococo_v1_13", JSON.stringify(rococo)],
  ["westend2", JSON.stringify(westend)],
])

const l = logger("Extension Connection Manager")

interface SpecInterface {
  name: string
  id: string
  relay_chain: string
}
/**
 * ConnectionManager is the main class involved in managing connections from
 * apps.  It keeps track of apps and it is also responsible for triggering
 * events when the state changes for the UI to update accordingly.
 */
export class ConnectionManager
  extends (EventEmitter as { new (): StateEmitter })
  implements ConnectionManagerInterface
{
  readonly #apps: App[] = []
  #client: Client | undefined = undefined
  #networks: Network[] = []
  smoldotLogLevel = 3

  /** registeredApps
   *
   * @returns a list of the names of apps that are currently connected
   */
  get registeredApps(): string[] {
    return this.#apps.map((a) => a.name)
  }

  /** registeredClients
   *
   * @returns a list of the networks that are currently connected
   */
  get registeredNetworks(): NetworkMainInfo[] {
    return this.#networks.map((s: Network) => ({
      name: s.name,
      id: s.id,
      status: s.status,
    }))
  }

  /**
   * apps
   *
   * @returns all the connected apps.
   */
  get apps(): ExposedAppInfo[] {
    return this.#apps.map((a: App) => ({
      appName: a.appName,
      chainName: a.chainName,
      healthStatus: a.healthStatus,
      pendingRequests: a.pendingRequests,
      state: a.state,
      url: a.url,
      tabId: a.tabId,
    }))
  }

  /**
   * getState
   *
   * @returns a view of the current state of the connection manager
   */
  getState(): State {
    const state: State = { apps: [] }
    return this.#apps.reduce((result, app) => {
      let a = result.apps.find(
        (a) => a.name === app.appName && a.tabId === app.tabId,
      )
      if (a === undefined) {
        a = {
          name: app.appName,
          tabId: app.tabId,
          networks: [],
        }
        result.apps.push(a)
      }
      a.networks.push({ name: app.chainName })
      return result
    }, state)
  }

  /**
   * disconnectTab disconnects all apps connected
   * from the supplied tabId
   *
   * @param tabId - the id of the tab to disconnect
   */
  disconnectTab(tabId: number): void {
    this.#apps
      .filter((a) => a.tabId && a.tabId === tabId)
      .forEach((a) => {
        this.disconnect(a)
      })
  }

  /**
   * disconnectAll disconnects all apps connected for all tabs
   */
  disconnectAll(): void {
    this.#apps.filter((a) => a).forEach((a) => this.disconnect(a))
  }

  /**
   * createApp maps the needed info and creates a new app
   */
  createApp(incPort: chrome.runtime.Port): App {
    const splitIdx = incPort.name.indexOf("::")
    if (splitIdx === -1) {
      const payload = `Invalid port name ${incPort.name} expected <app_name>::<chain_name>`
      const error: MessageFromManager = { type: "error", payload }
      incPort.postMessage(error)
      incPort.disconnect()
      throw new Error(payload)
    }
    const { name, sender } = incPort
    const appName: string = name.slice(0, splitIdx)
    const chainName: string = name.slice(splitIdx + 2, name.length)
    const tabId: number = sender?.tab?.id || -1
    const url: string | undefined = sender?.url
    const port: chrome.runtime.Port = incPort
    const state = "connected"
    const pendingRequests: string[] = []

    const healthChecker = smHealthChecker()
    const app: App = {
      appName,
      chainName,
      name,
      tabId,
      url,
      port,
      state,
      healthChecker,
      pendingRequests,
    }
    port.onMessage.addListener(this.#handleMessage)
    port.onDisconnect.addListener(() => {
      this.#handleDisconnect(app)
    })
    return app
  }

  /**
   * addApp registers a new app to be tracked by the background.
   *
   * @param port - a port for a fresh connection that was made to the background
   * by a content script.
   */
  addApp(port: chrome.runtime.Port): void {
    if (!this.#client) {
      throw new Error("Smoldot client does not exist.")
    }

    if (this.#findApp(port)) {
      port.postMessage({
        type: "error",
        payload: `App ${port.name} already exists.`,
      })
      port.disconnect()
      return
    }

    // if create an `AppMediator` throws, it has sent an error down the
    // port and disconnected it, so we should just ignore
    try {
      const app = this.createApp(port)
      this.registerApp(app)
    } catch (error) {
      l.error(`Error while adding chain: ${error}`)
    }
  }

  /**
   * registerApp is used to associate an app with a network
   *
   * @param app - The app
   */
  registerApp(app: App): void {
    this.#apps.push(app)
    this.emit("stateChanged", this.getState())
    this.emit("appsChanged", this.apps)
  }

  /**
   * unregisterApp is used after an app has finished processing any unsubscribe
   * messages and disconnected to fully unregister itself.
   * It also retrieves the chain that app was connected to and calls smoldot for removal
   *
   * @param app - The app
   */
  unregisterApp(app: App): void {
    const idx = this.#apps.findIndex((a) => a.name === app.name)
    this.#apps.splice(idx, 1)
    this.emit("stateChanged", this.getState())
    this.emit("appsChanged", this.apps)
  }

  /** shutdown shuts down the connected smoldot client. */
  async shutdown(): Promise<void> {
    await this.#client?.terminate()
    this.#client = undefined
  }

  /**
   * init Runs on onStartup and onInstalled of extension and
   * connects the default relayChains to smoldot
   */
  init = async () => {
    try {
      this.initSmoldot()
      for (const [key, value] of relayChains.entries()) {
        const jsonRpcCallback = (rpc: string) => {
          console.warn(`Got RPC from ${key} dummy chain: ${rpc}`)
        }
        await this.#client
          ?.addChain({
            chainSpec: value,
            jsonRpcCallback,
          })
          .catch((err) => console.error("Error", err))
      }
    } catch (e) {
      console.error(`Error creating smoldot: ${e}`)
    }
  }

  /**
   * initSmoldot initializes the smoldot client.
   */
  initSmoldot(): void {
    try {
      this.#client = start({
        maxLogLevel: this.smoldotLogLevel,
      })
    } catch (err) {
      l.error(`Error while initializing smoldot: ${err}`)
    }
  }

  /**
   * addChain: adds the Chain in the smoldot client. This is called only on new chains
   * added and not on default pnes - as the default ones do not need the extra checks
   * that take place here or be added to the Networks.
   *
   * @param spec - ChainSpec of chain to be added
   * @param jsonRpcCallback - The jsonRpcCallback function that should be triggered
   * @param relayChain - optional Smoldot's Chain for relay chain
   *
   * @returns addedChain - An the newly added chain info
   */
  async addChain(
    chainSpec: string,
    jsonRpcCallback?: JsonRpcCallback,
    tabId?: number,
  ): Promise<Network> {
    if (!this.#client) {
      throw new Error("Smoldot client does not exist.")
    }
    const { name, id, relay_chain }: SpecInterface = JSON.parse(
      chainSpec,
    ) as SpecInterface

    // identify all relay_chains init'ed from same app with tabId identifier
    const potentialNetworks: Network[] = relay_chain
      ? this.#networks.filter((n) => n.tabId === tabId)
      : this.#networks

    const addedChain = await this.#client.addChain({
      chainSpec,
      jsonRpcCallback,
      potentialRelayChains: potentialNetworks.map((r) => r.chain),
    })

    // This covers cases of refreshing browser in order to avoid
    // pilling up on this.#networks, the ones that were created from same tab
    const existingNetwork = this.#networks.find(
      (n) => n.name.toLowerCase() === name.toLowerCase() && n.tabId === tabId,
    )
    const network: Network = {
      tabId: tabId || 0,
      id,
      name: name.toLowerCase(),
      chain: addedChain,
      status: "connected",
    }
    !existingNetwork && this.#networks.push(network)
    return existingNetwork || network
  }

  #initHealthChecker = (app: App, isParachain?: boolean): void => {
    if (isParachain && app.parachain) {
      app.healthChecker?.setSendJsonRpc(app.parachain.sendJsonRpc)
    } else if (app.chain) {
      app.healthChecker?.setSendJsonRpc(app.chain.sendJsonRpc)
    }
    void app.healthChecker?.start((health: SmoldotHealth) => {
      if (
        health &&
        (app.healthStatus?.peers !== health.peers ||
          app.healthStatus.isSyncing !== health.isSyncing)
      ) {
        this.emit("appsChanged", this.apps)
      }
      app.healthStatus = health
    })
    // process any RPC requests that came in while waiting for `addChain` to complete
    if (app.pendingRequests.length > 0) {
      app.pendingRequests.forEach((req) => app.healthChecker?.sendJsonRpc(req))
      app.pendingRequests = []
    }
  }

  #handleError = (app: App, e: Error): void => {
    const error: MessageFromManager = { type: "error", payload: e.message }
    const { port } = app
    port.postMessage(error)
    port.disconnect()
    this.unregisterApp(app)
  }

  /** Handles the incoming message that contains Spec. */
  #handleSpecMessage = (msg: MessageToManager, app: App): void => {
    if (!msg.payload) {
      const error: Error = new Error("Relay chain spec was not found")
      this.#handleError(app, error)
      return
    }

    const chainSpec: string = msg.payload

    const rpcCallback = (rpc: string) => {
      const rpcResp: string | null | undefined =
        app.healthChecker?.responsePassThrough(rpc)
      if (rpcResp) app.port.postMessage({ type: "rpc", payload: rpcResp })
    }

    let chainPromise: Promise<void>
    // Means this is a parachain trying to connect
    if (msg.parachainPayload) {
      // Connect the main Chain first and on success the parachain with the chain
      // that just got connected as the relayChain
      const parachainSpec: string = msg.parachainPayload

      chainPromise = this.addChain(chainSpec, undefined, app.tabId)
        .then((network) => {
          app.chain = network.chain
          return this.addChain(parachainSpec, rpcCallback, app.tabId)
        })
        .then((network) => {
          app.parachain = network.chain
          app.chainName = (JSON.parse(parachainSpec) as SpecInterface).name
          return
        })
    } else {
      // Connect the main Chain only
      chainPromise = this.addChain(chainSpec, rpcCallback, app.tabId).then(
        (network) => {
          app.chain = network.chain
          return
        },
      )
    }

    chrome.storage.sync.get("notifications", (s) => {
      s.notifications &&
        chrome.notifications.create(app.port.name, {
          title: "Substrate Connect",
          message: `App ${app.appName} connected to ${app.chainName}.`,
          iconUrl: "./icons/icon-32.png",
          type: "basic",
        })
    })

    chainPromise
      .then(() => {
        this.#initHealthChecker(app, !!app.parachain)
      })
      .catch((e: Error) => {
        this.#handleError(app, e)
      })
  }

  #findApp(port: chrome.runtime.Port): App | undefined {
    return this.#apps.find(
      (a) => a.name === port.name && a.tabId === port.sender?.tab?.id,
    )
  }

  #handleMessage = (msg: MessageToManager, port: chrome.runtime.Port): void => {
    if (msg.type !== "rpc" && msg.type !== "spec") {
      console.warn(
        `Unrecognised message type ${msg.type} received from content script`,
      )
      return
    }
    const app = this.#findApp(port)
    if (!app) return
    if (msg.type === "spec" && app.chainName) {
      return this.#handleSpecMessage(msg, app)
    }

    if (app.chain === undefined) {
      // `addChain` hasn't resolved yet after the spec message so buffer the
      // messages to be sent when it does resolve
      app.pendingRequests.push(msg.payload)
      return
    }

    return app.healthChecker?.sendJsonRpc(msg.payload)
  }

  /**
   * disconnect tells the app to clean up its state and unsubscribe from any
   * active subscriptions and ultimately disconnects the communication port.
   */
  disconnect(app: App): void {
    this.#handleDisconnect(app)
  }

  #handleDisconnect = (app: App): void => {
    if (app.state === "disconnected") {
      throw new Error("Cannot disconnect - already disconnected")
    }
    // call remove() for both relaychain and parachain
    app.chain?.remove()
    app.parachain?.remove()
    this.#networks = this.#networks.filter((n) => n.tabId !== app.tabId)

    this.unregisterApp(app)

    app.state = "disconnected"
  }
}
