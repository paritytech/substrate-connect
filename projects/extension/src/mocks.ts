import {
  ToApplication,
  ToExtension,
} from "@substrate/connect-extension-protocol"
import { AddChainOptions, Chain, Client } from "smoldot"

const noop: any = Function.prototype

export const TEST_URL = "https://test.com"

export type HeaderlessToExtension<T extends ToExtension> = T extends {
  origin: "substrate-connect-client"
} & infer V
  ? Omit<V, "chainId">
  : unknown

export type HeaderlessToApplication<T extends ToApplication> = T extends {
  origin: "substrate-connect-extension"
} & infer V
  ? Omit<V, "chainId">
  : unknown

export class MockPort implements chrome.runtime.Port {
  sender: any
  connected = true
  postedMessages: Array<any> = []
  readonly name: string
  #callbacks = {
    onDisconnect: noop,
    onMessageCb: noop,
  }

  constructor(name: string, tabId: number, url = TEST_URL) {
    this.name = name
    this.sender = { url, tab: { id: tabId } }
  }

  postMessage(message: any) {
    this.postedMessages.push(message)
  }

  disconnect() {
    this.connected = false
    this.#callbacks.onDisconnect()
  }

  setTabId(id: number): void {
    this.sender.tab.id = id
  }

  _sendExtensionMessage(message: ToExtension): void {
    this.#callbacks.onMessageCb({
      ...message,
      chainId: this.name,
      origin: "substrate-connect-client",
    })
  }

  _sendAppMessage(msg: ToApplication): void {
    this.#callbacks.onMessageCb(msg)
  }

  onMessage = {
    addListener: (listener: never) => {
      this.#callbacks.onMessageCb = listener
    },
    removeListener: () => {
      this.#callbacks.onMessageCb = noop
    },
  } as any

  onDisconnect = {
    addListener: (listener: never) => {
      this.#callbacks.onDisconnect = listener
    },
    removeListener: () => {
      this.#callbacks.onDisconnect = noop
    },
  } as any
}

export class MockedChain implements Chain {
  options: AddChainOptions
  isActive = true
  receivedMessages: string[] = []
  #onRemove: () => void

  constructor(options: AddChainOptions, onRemove: () => void) {
    this.#onRemove = onRemove
    this.options = options
  }

  sendJsonRpc(rpc: string) {
    this.receivedMessages.push(rpc)
  }

  _sendResponse(message: string) {
    this.options.jsonRpcCallback?.(message)
  }

  databaseContent() {
    return Promise.resolve("")
  }
  remove() {
    this.#onRemove()
    this.isActive = false
  }
}

export class MockSmoldotClient implements Client {
  chains = new Set<MockedChain>()
  addChain(options: AddChainOptions): Promise<MockedChain> {
    const chain = new MockedChain(options, () => {
      this.chains.delete(chain)
    })
    this.chains.add(chain)
    return Promise.resolve(chain)
  }
  terminate() {
    this.chains.clear()
    return Promise.resolve()
  }
}
