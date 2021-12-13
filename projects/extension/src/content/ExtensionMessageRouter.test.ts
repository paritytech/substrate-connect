import { jest } from "@jest/globals"
import { ExtensionMessageRouter } from "./ExtensionMessageRouter"
import {
  ToExtension,
  ToExtensionMessageType,
  ToWebpage,
  ToWebpageMessageType,
  provider,
  ToWebpageBody,
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

describe("Disconnect and incorrect cases", () => {
  beforeEach(() => {
    chrome.runtime.connect.mockClear()
    router = new ExtensionMessageRouter()
    router.listen()
  })

  afterEach(() => {
    router.stop()
  })

  test("port disconnecting sends disconnect message and removes port", async () => {
    const port = new MockPort("test-app::westend")
    const connect = chrome.runtime.connect
    connect.mockImplementation(() => port)
    const connectMessage: ToExtension = {
      header: {
        origin: "extension-provider",
        providerId: 1,
      },
      body: {
        type: ToExtensionMessageType.Connect,
        payload: {
          displayName: "test-app",
        },
      },
    }

    provider.send(connectMessage)
    await waitForMessageToBePosted()

    const handler = jest.fn()
    provider.listen(handler)
    port.triggerDisconnect()
    await waitForMessageToBePosted()

    const expectedMessage: ToWebpage = {
      header: {
        origin: "content-script",
        providerId: 1,
      },
      body: {
        type: ToWebpageMessageType.Disconnect,
      },
    }

    expect(router.connections.length).toBe(0)
    const { data } = handler.mock.calls[0][0] as MessageEvent<ToWebpage>
    expect(data).toEqual(expectedMessage)
  })

  test("incorrect origin does nothing to connections", async () => {
    window.postMessage(
      {
        origin: "something-else",
      },
      "*",
    )

    await waitForMessageToBePosted()
    expect(chrome.runtime.connect).not.toHaveBeenCalled()
    expect(router.connections.length).toBe(0)
  })

  test("disconnect disconnects established connection", async () => {
    const connectMessage: ToExtension = {
      header: {
        origin: "extension-provider",
        providerId: 1,
      },
      body: {
        type: ToExtensionMessageType.Connect,
        payload: {
          displayName: "test-app",
        },
      },
    }
    provider.send(connectMessage)
    await waitForMessageToBePosted()

    const disconnectMessage: ToExtension = {
      header: {
        origin: "extension-provider",
        providerId: 1,
      },
      body: {
        type: ToExtensionMessageType.Disconnect,
      },
    }
    provider.send(disconnectMessage)
    await waitForMessageToBePosted()

    expect(chrome.runtime.connect).toHaveBeenCalledTimes(1)
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
    const connectMessage: ToExtension = {
      header: {
        origin: "extension-provider",
        providerId: 1,
      },
      body: {
        type: ToExtensionMessageType.Connect,
        payload: {
          displayName: "test-app",
        },
      },
    }
    provider.send(connectMessage)

    await waitForMessageToBePosted()
    expect(chrome.runtime.connect).toHaveBeenCalledTimes(1)
    expect(router.connections.length).toBe(1)
    expect(router.connections[0]).toBe(1)
  })

  test("forwards rpc message from app -> extension", async () => {
    const port = new MockPort("test-app::westend")
    chrome.runtime.connect.mockImplementation(() => port)

    const connectMessage: ToExtension = {
      header: {
        origin: "extension-provider",
        providerId: 1,
      },
      body: {
        type: ToExtensionMessageType.Connect,
        payload: {
          displayName: "test-app",
        },
      },
    }
    provider.send(connectMessage)
    await waitForMessageToBePosted()

    // rpc
    const rpcMessage: ToExtension = {
      header: {
        origin: "extension-provider",
        providerId: 1,
      },
      body: {
        type: ToExtensionMessageType.Rpc,
        payload:
          '{"id":1,"jsonrpc":"2.0","method":"state_getStorage","params":["<hash>"]}',
      },
    }
    provider.send(rpcMessage)
    await waitForMessageToBePosted()
    expect(chrome.runtime.connect).toHaveBeenCalledTimes(1)
    expect(router.connections.length).toBe(1)
    expect(port.postMessage).toHaveBeenCalledWith(rpcMessage.body)
  })

  test("forwards rpc message from extension -> app", async () => {
    const port = new MockPort("test-app::westend")
    chrome.runtime.connect.mockImplementation(() => port)
    // connect
    const connectMessage: ToExtension = {
      header: {
        origin: "extension-provider",
        providerId: 1,
      },
      body: {
        type: ToExtensionMessageType.Connect,
        payload: {
          displayName: "test-app",
        },
      },
    }
    provider.send(connectMessage)
    await waitForMessageToBePosted()

    const handler = jest.fn()
    window.addEventListener("message", handler)
    const body: ToWebpageBody = {
      type: ToWebpageMessageType.Rpc,
      payload: '{"id:":1,"jsonrpc:"2.0","result":666}',
    }
    port.triggerMessage(body)
    await waitForMessageToBePosted()

    expect(chrome.runtime.connect).toHaveBeenCalledTimes(1)
    expect(port.disconnect).not.toHaveBeenCalled()
    expect(handler).toHaveBeenCalled()
    const forwarded = handler.mock.calls[0][0] as MessageEvent<ToWebpage>
    expect(forwarded.data.body).toEqual(body)
  })

  test("forwards error message from extension -> app", async () => {
    const port = new MockPort("test-app::westend")
    chrome.runtime.connect.mockImplementation(() => port)
    // connect
    const connectMessage: ToExtension = {
      header: {
        origin: "extension-provider",
        providerId: 1,
      },
      body: {
        type: ToExtensionMessageType.Connect,
        payload: {
          displayName: "test-app",
        },
      },
    }
    provider.send(connectMessage)
    await waitForMessageToBePosted()

    const handler = jest.fn()
    window.addEventListener("message", handler)
    const errorMessage: ToWebpageBody = {
      type: ToWebpageMessageType.Error,
      payload: "Boom!",
    }
    port.triggerMessage(errorMessage)
    await waitForMessageToBePosted()

    expect(handler).toHaveBeenCalled()
    const forwarded = handler.mock.calls[0][0] as MessageEvent<ToWebpage>
    expect(forwarded.data.body).toEqual(errorMessage)
  })
})
