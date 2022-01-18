/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */

import {
  ToApplication,
  ToExtension,
} from "@substrate/connect-extension-protocol"
import { AddChainOptions, Chain, Client } from "@substrate/smoldot-light"

const noop: any = Function.prototype

export const TEST_URL = "https://test.com"

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

  _sendExtensionMessage(
    message: Omit<ToExtension, "origin" | "chainId">,
  ): void {
    this.#callbacks.onMessageCb({
      ...message,
      chainId: this.name,
      origin: "extension-provider",
    })
  }

  _sendAppMessage({
    type,
    payload,
  }: Pick<ToApplication, "type" | "payload">): void {
    this.#callbacks.onMessageCb({ type, payload })
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
  constructor() {}
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
