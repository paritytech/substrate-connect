/*
 * @jest-environment jsdom
 */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { jest } from "@jest/globals"
import { ExtensionProvider } from "./ExtensionProvider"
import {
  ToExtension,
  ToExtensionMessageType,
  ToWebpageMessageType,
  extension,
} from "@substrate/connect-extension-protocol"
;(globalThis as any).crypto = {}
globalThis.crypto.getRandomValues = <T extends ArrayBufferView | null>(
  input: T,
): T => {
  ;(input as any)[2] = Math.floor(Math.random() * 2 ** 16)
  return input
}

const waitForMessageToBePosted = (): Promise<null> => {
  // window.postMessge is async so we must do a short setTimeout to yield to
  // the event loop
  return new Promise((resolve) => setTimeout(resolve, 10, null))
}

const westendSpec = JSON.stringify({ name: "Westend", id: "westend2" })
const rococoSpec = JSON.stringify({ name: "Rococo", id: "rococo" })

let handler = jest.fn()
beforeEach(() => {
  handler = jest.fn()
  extension.listen(handler)
})

afterEach(() => {
  window.removeEventListener("message", handler)
})

test("connected and sends correct spec message", async () => {
  const ep = new ExtensionProvider("test", westendSpec)
  const emitted = jest.fn()
  ep.on("connected", emitted)
  await ep.connect()
  await waitForMessageToBePosted()

  const expectedMessage: ToExtension = {
    header: {
      origin: "extension-provider",
      providerId: ep.providerId,
    },
    body: {
      type: ToExtensionMessageType.Spec,
      payload: {
        relaychain: westendSpec,
      },
    },
  }

  expect(handler).toHaveBeenCalledTimes(2)
  const { data } = handler.mock.calls[1][0] as MessageEvent<ToExtension>
  expect(data).toEqual(expectedMessage)
})

test("connected multiple chains and sends correct spec message", async () => {
  const ep1 = new ExtensionProvider("test", westendSpec)
  const ep2 = new ExtensionProvider("test2", rococoSpec)
  const emitted1 = jest.fn()
  const emitted2 = jest.fn()
  ep1.on("connected", emitted1)
  ep2.on("connected", emitted2)
  await ep1.connect()
  await waitForMessageToBePosted()
  await ep2.connect()
  await waitForMessageToBePosted()

  const expectedMessage1: ToExtension = {
    header: {
      origin: "extension-provider",
      providerId: ep1.providerId,
    },
    body: {
      type: ToExtensionMessageType.Spec,
      payload: {
        relaychain: westendSpec,
      },
    },
  }

  const expectedMessage2: ToExtension = {
    header: {
      origin: "extension-provider",
      providerId: ep2.providerId,
    },
    body: {
      type: ToExtensionMessageType.Spec,
      payload: {
        relaychain: rococoSpec,
      },
    },
  }

  expect(handler).toHaveBeenCalledTimes(4)
  const { data: data1 } = handler.mock.calls[1][0] as MessageEvent<ToExtension>
  const { data: data2 } = handler.mock.calls[3][0] as MessageEvent<ToExtension>

  expect(data1).toEqual(expectedMessage1)
  expect(data2).toEqual(expectedMessage2)
})

test("connected parachain sends correct spec message", async () => {
  const ep = new ExtensionProvider("test", westendSpec)
  const emitted = jest.fn()
  ep.on("connected", emitted)
  await ep.connect()
  await waitForMessageToBePosted()

  const expectedMessage: ToExtension = {
    header: {
      origin: "extension-provider",
      providerId: ep.providerId,
    },
    body: {
      type: ToExtensionMessageType.Spec,
      payload: {
        relaychain: westendSpec,
      },
    },
  }

  expect(handler).toHaveBeenCalledTimes(2)
  const { data } = handler.mock.calls[1][0] as MessageEvent<ToExtension>

  expect(data).toEqual(expectedMessage)
})

test("connect sends connect message and emits connected", async () => {
  const ep = new ExtensionProvider("test", westendSpec)
  await ep.connect()
  await waitForMessageToBePosted()

  const expectedMessage: ToExtension = {
    header: {
      origin: "extension-provider",
      providerId: ep.providerId,
    },
    body: {
      type: ToExtensionMessageType.Connect,
      payload: {
        displayName: "test",
      },
    },
  }
  expect(handler).toHaveBeenCalledTimes(2)
  const { data } = handler.mock.calls[0][0] as MessageEvent<ToExtension>

  expect(data).toEqual(expectedMessage)
})

test("disconnect sends disconnect message and emits disconnected", async () => {
  const ep = new ExtensionProvider("test", westendSpec)
  const emitted = jest.fn()
  await ep.connect()

  ep.on("disconnected", emitted)
  void ep.disconnect()
  await waitForMessageToBePosted()

  const expectedMessage: ToExtension = {
    header: {
      origin: "extension-provider",
      providerId: ep.providerId,
    },
    body: { type: ToExtensionMessageType.Disconnect },
  }

  expect(handler).toHaveBeenCalledTimes(3)
  const { data } = handler.mock.calls[2][0] as MessageEvent<ToExtension>
  expect(data).toEqual(expectedMessage)
  expect(ep.isConnected).toBe(false)
  expect(emitted).toHaveBeenCalledTimes(1)
})

test("disconnects and emits disconnected when it receives a disconnect message", async () => {
  const ep = new ExtensionProvider("test", westendSpec)
  const emitted = jest.fn()
  await ep.connect()

  ep.on("disconnected", emitted)
  await waitForMessageToBePosted()
  extension.send({
    header: { origin: "content-script", providerId: ep.providerId },
    body: { type: ToWebpageMessageType.Disconnect },
  })
  await waitForMessageToBePosted()
  expect(emitted).toHaveBeenCalled()
  expect(ep.isConnected).toBe(false)
})

test("emits error when it receives an error message", async () => {
  const ep = new ExtensionProvider("test", westendSpec)
  await ep.connect()
  await waitForMessageToBePosted()
  const errorMessage = {
    header: { origin: "content-script", providerId: ep.providerId },
    body: {
      type: ToWebpageMessageType.Error,
      payload: "Boom!",
    },
  }
  const errorHandler = jest.fn()
  ep.on("error", errorHandler)
  window.postMessage(errorMessage, "*")
  await waitForMessageToBePosted()

  expect(errorHandler).toHaveBeenCalled()
  const error = errorHandler.mock.calls[0][0] as Error
  const innerMessage = errorMessage.body.payload
  expect(error.message).toEqual(innerMessage)
})

test("it routes incoming messages to the correct Provider", async () => {
  const ep1 = new ExtensionProvider("ExtensionProvider1", westendSpec)
  await ep1.connect()

  const ep2 = new ExtensionProvider("ExtensionProvider2", westendSpec)
  await ep2.connect()
  await waitForMessageToBePosted()

  let extensionProvider1Response: string | undefined = undefined
  let extensionProvider2Response: string | undefined = undefined

  ep1
    .send("requestSomeData", [])
    .then((response: string) => {
      extensionProvider1Response = response
    })
    .catch(() => {
      extensionProvider1Response = "Error"
    })
  await waitForMessageToBePosted()

  ep2
    .send("requestOtherData", [])
    .then((response: string) => {
      extensionProvider2Response = response
    })
    .catch(() => {
      extensionProvider2Response = "Error"
    })
  await waitForMessageToBePosted()

  const latestRequest = handler.mock.calls[
    handler.mock.calls.length - 1
  ][0] as any

  const latestRequestRpcId = (
    JSON.parse(latestRequest.data.body?.payload ?? "{}") as {
      id: number
    }
  ).id

  extension.send({
    header: {
      origin: "content-script" as const,
      providerId: ep2.providerId,
    },
    body: {
      type: ToWebpageMessageType.Rpc,
      payload: JSON.stringify({
        id: latestRequestRpcId,
        jsonrpc: "2.0",
        result: "hi ExtensionProvider2!",
      }),
    },
  })

  await waitForMessageToBePosted()

  expect(extensionProvider2Response).toBe("hi ExtensionProvider2!")
  expect(extensionProvider1Response).toBe(undefined)
})
