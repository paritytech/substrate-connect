/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { jest } from "@jest/globals"
import { ExtensionMessageRouter } from "./ExtensionMessageRouter"
import {
  ToExtension,
  ToApplication,
} from "@substrate/connect-extension-protocol"
import { MockPort } from "../mocks"
import { chrome } from "jest-chrome"

let router: ExtensionMessageRouter
let port: MockPort

const waitForMessageToBePosted = (): Promise<null> => {
  // window.postMessge is async so we must do a short setTimeout to yield to
  // the event loop
  return new Promise((resolve) => setTimeout(resolve, 10, null))
}

const sendMessage = (msg: ToExtension): void => {
  window.postMessage(msg, "*")
}

describe("Disconnect and incorrect cases", () => {
  beforeEach(() => {
    chrome.runtime.connect.mockClear()
    router = new ExtensionMessageRouter()
    router.listen()
  })

  afterEach(() => {
    router.stop()
  })

  test("port disconnecting sends an error message and removes port", async () => {
    const port = new MockPort("test", 0)
    const connect = chrome.runtime.connect
    connect.mockImplementation(() => port)
    sendMessage({
      chainId: "test",
      type: "add-well-known-chain",
      payload: "westend",
      origin: "substrate-connect-client",
    })
    await waitForMessageToBePosted()

    const handler = jest.fn()
    window.addEventListener("message", handler)
    port.disconnect()
    await waitForMessageToBePosted()

    const expectedMessage: Partial<ToApplication> = {
      origin: "substrate-connect-extension",
      type: "error",
    }

    expect(router.connections.length).toBe(0)
    const { data } = handler.mock.calls[0][0] as MessageEvent
    expect(data).toMatchObject(expectedMessage)
  })

  test("incorrect origin does nothing to connections", async () => {
    sendMessage({
      origin: "something-else",
    } as unknown as ToExtension)

    await waitForMessageToBePosted()
    expect(chrome.runtime.connect).not.toHaveBeenCalled()
    expect(router.connections.length).toBe(0)
  })
})

describe("Connection and forward cases", () => {
  beforeEach(() => {
    chrome.runtime.connect.mockClear()
    router = new ExtensionMessageRouter()
    router.listen()
    port = new MockPort("test", 0)
    chrome.runtime.connect.mockImplementation(() => port)
  })

  afterEach(() => {
    router.stop()
  })

  test("connect establishes a port", async () => {
    const chainId = "test"
    sendMessage({
      chainId,
      type: "add-well-known-chain",
      payload: "westend",
      origin: "substrate-connect-client",
    })

    await waitForMessageToBePosted()
    expect(chrome.runtime.connect).toHaveBeenCalledTimes(1)
    expect(router.connections.length).toBe(1)
    expect(router.connections[0]).toBe(chainId)
  })

  test("forwards rpc message from app -> extension", async () => {
    const port = new MockPort("test", 0)
    chrome.runtime.connect.mockImplementation(() => port)
    // connect
    sendMessage({
      chainId: "test",
      type: "add-well-known-chain",
      payload: "westend",
      origin: "substrate-connect-client",
    })
    await waitForMessageToBePosted()

    // rpc
    const rpcMessage: ToExtension = {
      chainId: "test",
      origin: "substrate-connect-client",
      type: "rpc",
      payload:
        '{"id":1,"jsonrpc":"2.0","method":"state_getStorage","params":["<hash>"]}',
    }
    sendMessage(rpcMessage)
    await waitForMessageToBePosted()
    expect(chrome.runtime.connect).toHaveBeenCalledTimes(1)
    expect(router.connections.length).toBe(1)
    const sample = {
      type: rpcMessage.type,
      payload: rpcMessage.payload,
    }
    expect(port.postedMessages[port.postedMessages.length - 1]).toEqual(sample)
  })

  test("forwards rpc message from extension -> app", async () => {
    const port = new MockPort("test", 0)
    chrome.runtime.connect.mockImplementation(() => port)
    // connect
    sendMessage({
      chainId: "test",
      type: "add-well-known-chain",
      payload: "westend",
      origin: "substrate-connect-client",
    })
    await waitForMessageToBePosted()

    const handler = jest.fn()
    window.addEventListener("message", handler)
    port._sendAppMessage({
      type: "rpc",
      payload: '{"id:":1,"jsonrpc:"2.0","result":666}',
    })
    await waitForMessageToBePosted()

    expect(chrome.runtime.connect).toHaveBeenCalledTimes(1)
    expect(port.connected).toBe(true)
    expect(handler).toHaveBeenCalled()
    const forwarded = handler.mock.calls[0][0] as MessageEvent
    expect(forwarded.data).toEqual({
      chainId: "test",
      origin: "substrate-connect-extension",
      type: "rpc",
      payload: '{"id:":1,"jsonrpc:"2.0","result":666}',
    })
  })

  test("forwards error message from extension -> app", async () => {
    const port = new MockPort("test", 0)
    chrome.runtime.connect.mockImplementation(() => port)
    // connect
    sendMessage({
      chainId: "test",
      type: "add-well-known-chain",
      payload: "westend",
      origin: "substrate-connect-client",
    })
    await waitForMessageToBePosted()

    const handler = jest.fn()
    window.addEventListener("message", handler)
    port._sendAppMessage({ type: "error", payload: "Boom!" })
    await waitForMessageToBePosted()

    expect(handler).toHaveBeenCalled()
    const forwarded = handler.mock.calls[0][0] as MessageEvent
    expect(forwarded.data).toEqual({
      origin: "substrate-connect-extension",
      chainId: "test",
      type: "error",
      payload: "Boom!",
    })
  })
})
