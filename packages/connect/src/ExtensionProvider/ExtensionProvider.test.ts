/*
 * @jest-environment jsdom
 */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { jest } from "@jest/globals"
import type {
  ExtensionProvider as IExtensionProvider,
  ExtensionProviderClass,
} from "./ExtensionProvider"

jest.unstable_mockModule("./getRandomChainId.js", () => {
  let nextChainId = "test"
  return {
    _setNextChainId(chainId: string) {
      nextChainId = chainId
    },
    getRandomChainId: () => nextChainId,
  }
})

let ExtensionProvider: ExtensionProviderClass
let mockedGetRandomChainId: { _setNextChainId: (chainId: string) => void }
beforeAll(async () => {
  ;({ ExtensionProvider } = await import("./ExtensionProvider"))
  mockedGetRandomChainId = (await import(
    "./getRandomChainId.js"
  )) as unknown as typeof mockedGetRandomChainId
})

import {
  ToExtension,
  ToApplication,
} from "@substrate/connect-extension-protocol"

const waitForMessageToBePosted = (): Promise<null> => {
  // window.postMessge is async so we must do a short setTimeout to yield to
  // the event loop
  return new Promise((resolve) => setTimeout(resolve, 10, null))
}

const sendMessage = (msg: ToApplication): void => {
  window.postMessage(msg, "*")
}

const westendSpec = JSON.stringify({ name: "Westend", id: "westend2" })
const rococoSpec = JSON.stringify({ name: "Rococo", id: "rococo" })

const emulateConnect = (
  ep: IExtensionProvider,
  chainId = "test",
): Promise<void> => {
  const p = ep.connect()
  sendMessage({
    origin: "content-script",
    chainId,
    type: "chain-ready",
  })
  return p
}

let handler = jest.fn()
beforeEach(() => {
  handler = jest.fn()
  window.addEventListener("message", handler)
})

afterEach(() => {
  window.removeEventListener("message", handler)
})

test("connected and sends correct spec message", async () => {
  const ep = new ExtensionProvider(westendSpec)
  const emitted = jest.fn()
  ep.on("connected", emitted)
  await emulateConnect(ep)
  await waitForMessageToBePosted()

  const expectedMessage: Partial<ToExtension> = {
    origin: "extension-provider",
    type: "add-chain",
    payload: {
      chainSpec: '{"name":"Westend","id":"westend2"}',
      potentialRelayChainIds: [],
    },
  }
  expect(handler).toHaveBeenCalledTimes(2)
  const { data } = handler.mock.calls[0][0] as MessageEvent
  expect(data).toMatchObject(expectedMessage)
})

test("connected multiple chains and sends correct spec message", async () => {
  const ep1 = new ExtensionProvider(westendSpec)
  const ep2 = new ExtensionProvider(rococoSpec)
  const emitted1 = jest.fn()
  const emitted2 = jest.fn()
  ep1.on("connected", emitted1)
  ep2.on("connected", emitted2)
  await emulateConnect(ep1)
  await waitForMessageToBePosted()
  await emulateConnect(ep2)
  await waitForMessageToBePosted()

  const expectedMessage1: Partial<ToExtension> = {
    origin: "extension-provider",
    type: "add-chain",
    payload: {
      chainSpec: '{"name":"Westend","id":"westend2"}',
      potentialRelayChainIds: [],
    },
  }
  const expectedMessage2: Partial<ToExtension> = {
    origin: "extension-provider",
    type: "add-chain",
    payload: {
      chainSpec: '{"name":"Rococo","id":"rococo"}',
      potentialRelayChainIds: [],
    },
  }

  expect(handler).toHaveBeenCalledTimes(4)
  const data1 = handler.mock.calls[0][0] as MessageEvent
  const data2 = handler.mock.calls[2][0] as MessageEvent
  expect(data1.data).toMatchObject(expectedMessage1)
  expect(data2.data).toMatchObject(expectedMessage2)
})

test("connected parachain sends correct spec message", async () => {
  const ep = new ExtensionProvider(westendSpec)
  const emitted = jest.fn()
  ep.on("connected", emitted)
  await emulateConnect(ep)
  await waitForMessageToBePosted()

  const expectedMessage: Partial<ToExtension> = {
    origin: "extension-provider",
    type: "add-chain",
    payload: {
      chainSpec: '{"name":"Westend","id":"westend2"}',
      potentialRelayChainIds: [],
    },
  }
  expect(handler).toHaveBeenCalledTimes(2)
  const { data } = handler.mock.calls[0][0] as MessageEvent
  expect(data).toMatchObject(expectedMessage)
})

test("disconnect sends disconnect message and emits disconnected", async () => {
  const ep = new ExtensionProvider(westendSpec)
  const emitted = jest.fn()
  await emulateConnect(ep)

  ep.on("disconnected", emitted)
  void ep.disconnect()
  await waitForMessageToBePosted()

  expect(ep.isConnected).toBe(false)
  expect(emitted).toHaveBeenCalledTimes(1)
})

test("disconnects and emits an error when it receives an error message", async () => {
  mockedGetRandomChainId._setNextChainId("foo")
  const ep = new ExtensionProvider(westendSpec)
  const emitted = jest.fn()
  await emulateConnect(ep, "foo")

  ep.on("error", emitted)
  await waitForMessageToBePosted()
  sendMessage({
    origin: "content-script",
    chainId: "foo",
    type: "error",
    payload: "disconnected",
  })
  await waitForMessageToBePosted()
  expect(emitted).toHaveBeenCalled()
  expect(ep.isConnected).toBe(false)
})

test("emits error when it receives an error message", async () => {
  mockedGetRandomChainId._setNextChainId("foo")
  const ep = new ExtensionProvider(westendSpec)
  await emulateConnect(ep, "foo")
  await waitForMessageToBePosted()
  const errorMessage: ToApplication = {
    origin: "content-script",
    chainId: "foo",
    type: "error",
    payload: "Boom!",
  }
  const errorHandler = jest.fn()
  ep.on("error", errorHandler)
  sendMessage(errorMessage)
  await waitForMessageToBePosted()

  expect(errorHandler).toHaveBeenCalled()
  const error = errorHandler.mock.calls[0][0] as Error
  expect(error.message).toEqual(errorMessage.payload)
})

test.skip("it routes incoming messages to the correct Provider", async () => {
  mockedGetRandomChainId._setNextChainId("foo1")
  const ep1 = new ExtensionProvider("ExtensionProvider1", westendSpec)
  await emulateConnect(ep1, "foo1")
  mockedGetRandomChainId._setNextChainId("foo2")
  const ep2 = new ExtensionProvider("ExtensionProvider2", westendSpec)
  await emulateConnect(ep2, "foo2")
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
  ][0] as MessageEvent<{ payload: string; chainId: string }>

  const latestRequestRpcId = (
    JSON.parse(latestRequest?.data.payload ?? "{}") as {
      id: number
    }
  ).id
  const latestChainId = latestRequest?.data.chainId

  sendMessage({
    origin: "content-script",
    chainId: latestChainId,
    type: "rpc",
    payload: JSON.stringify({
      id: latestRequestRpcId,
      jsonrpc: "2.0",
      result: "hi ExtensionProvider2!",
    }),
  })

  await waitForMessageToBePosted()

  expect(extensionProvider2Response).toBe("hi ExtensionProvider2!")
  expect(extensionProvider1Response).toBe(undefined)
})
