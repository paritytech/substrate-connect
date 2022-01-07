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
    const port = new MockPort("test-app::westend")
    const connect = chrome.runtime.connect
    connect.mockImplementation(() => port)
    sendMessage({
      chainId: 1,
      chainName: "westend",
      type: "spec",
      payload: "westend",
      origin: "extension-provider",
    })
    await waitForMessageToBePosted()

    const handler = jest.fn()
    window.addEventListener("message", handler)
    port.triggerDisconnect()
    await waitForMessageToBePosted()

    const expectedMessage: ToApplication = {
      origin: "content-script",
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
    port = new MockPort("test-app::westend")
    chrome.runtime.connect.mockImplementation(() => port)
  })

  afterEach(() => {
    router.stop()
  })

  test("connect establishes a port", async () => {
    sendMessage({
      chainId: 1,
      chainName: "westend",
      type: "spec",
      payload: "westend",
      origin: "extension-provider",
    })

    await waitForMessageToBePosted()
    expect(chrome.runtime.connect).toHaveBeenCalledTimes(1)
    expect(router.connections.length).toBe(1)
    expect(router.connections[0]).toBe("1")
  })

  test("forwards rpc message from app -> extension", async () => {
    const port = new MockPort("test-app::westend")
    chrome.runtime.connect.mockImplementation(() => port)
    // connect
    sendMessage({
      chainId: 1,
      chainName: "westend",
      type: "spec",
      payload: "westend",
      origin: "extension-provider",
    })
    await waitForMessageToBePosted()

    // rpc
    const rpcMessage: ToExtension = {
      chainId: 1,
      chainName: "westend",
      type: "rpc",
      payload:
        '{"id":1,"jsonrpc":"2.0","method":"state_getStorage","params":["<hash>"]}',
      origin: "extension-provider",
    }
    sendMessage(rpcMessage)
    await waitForMessageToBePosted()
    expect(chrome.runtime.connect).toHaveBeenCalledTimes(1)
    expect(router.connections.length).toBe(1)
    const sample = {
      type: rpcMessage.type,
      payload: rpcMessage.payload,
    }
    expect(port.postMessage).toHaveBeenCalledWith(sample)
  })

  test("forwards rpc message from extension -> app", async () => {
    const port = new MockPort("test-app::westend")
    chrome.runtime.connect.mockImplementation(() => port)
    // connect
    sendMessage({
      chainId: 1,
      chainName: "westend",
      type: "spec",
      payload: "westend",
      origin: "extension-provider",
    })
    await waitForMessageToBePosted()

    const handler = jest.fn()
    window.addEventListener("message", handler)
    port.triggerMessage({
      type: "rpc",
      payload: '{"id:":1,"jsonrpc:"2.0","result":666}',
    })
    await waitForMessageToBePosted()

    expect(chrome.runtime.connect).toHaveBeenCalledTimes(1)
    expect(port.disconnect).not.toHaveBeenCalled()
    expect(handler).toHaveBeenCalled()
    const forwarded = handler.mock.calls[0][0] as MessageEvent
    expect(forwarded.data).toEqual({
      origin: "content-script",
      type: "rpc",
      payload: '{"id:":1,"jsonrpc:"2.0","result":666}',
    })
  })

  test("forwards error message from extension -> app", async () => {
    const port = new MockPort("test-app::westend")
    chrome.runtime.connect.mockImplementation(() => port)
    // connect
    sendMessage({
      chainId: 1,
      chainName: "westend",
      type: "spec",
      payload: "westend",
      origin: "extension-provider",
    })
    await waitForMessageToBePosted()

    const handler = jest.fn()
    window.addEventListener("message", handler)
    port.triggerMessage({ type: "error", payload: "Boom!" })
    await waitForMessageToBePosted()

    expect(handler).toHaveBeenCalled()
    const forwarded = handler.mock.calls[0][0] as MessageEvent
    expect(forwarded.data).toEqual({
      origin: "content-script",
      type: "error",
      payload: "Boom!",
    })
  })
})
