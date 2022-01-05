/*
 * @jest-environment jsdom
 */
import { jest } from "@jest/globals"
import { ExtensionProvider } from "./ExtensionProvider"
import {
  ProviderMessage,
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

let handler = jest.fn()
beforeEach(() => {
  handler = jest.fn()
  window.addEventListener("message", handler)
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

  const expectedMessage: Partial<ToExtension> = {
    appName: "test",
    chainName: "Westend",
    action: "forward",
    origin: "extension-provider",
    payload: '{"name":"Westend","id":"westend2"}',
    type: "spec",
  }
  expect(handler).toHaveBeenCalledTimes(2)
  const { data } = handler.mock.calls[1][0] as ProviderMessage
  expect(data).toMatchObject(expectedMessage)
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

  const expectedMessage1: Partial<ToExtension> = {
    appName: "test",
    chainName: "Westend",
    action: "forward",
    origin: "extension-provider",
    payload: '{"name":"Westend","id":"westend2"}',
    type: "spec",
  }
  const expectedMessage2: Partial<ToExtension> = {
    appName: "test2",
    chainName: "Rococo",
    action: "forward",
    origin: "extension-provider",
    payload: '{"name":"Rococo","id":"rococo"}',
    type: "spec",
  }

  expect(handler).toHaveBeenCalledTimes(4)
  const data1 = handler.mock.calls[1][0] as ProviderMessage
  const data2 = handler.mock.calls[3][0] as ProviderMessage
  expect(data1.data).toMatchObject(expectedMessage1)
  expect(data2.data).toMatchObject(expectedMessage2)
})

test("connected parachain sends correct spec message", async () => {
  const ep = new ExtensionProvider("test", westendSpec)
  const emitted = jest.fn()
  ep.on("connected", emitted)
  await ep.connect()
  await waitForMessageToBePosted()

  const expectedMessage: Partial<ToExtension> = {
    appName: "test",
    chainName: "Westend",
    action: "forward",
    origin: "extension-provider",
    payload: '{"name":"Westend","id":"westend2"}',
    type: "spec",
  }
  expect(handler).toHaveBeenCalledTimes(2)
  const { data } = handler.mock.calls[1][0] as ProviderMessage
  expect(data).toMatchObject(expectedMessage)
})

test("connect sends connect message and emits connected", async () => {
  const ep = new ExtensionProvider("test", westendSpec)
  await ep.connect()
  await waitForMessageToBePosted()

  const expectedMessage: Partial<ToExtension> = {
    appName: "test",
    chainName: "Westend",
    action: "connect",
    origin: "extension-provider",
  }
  expect(handler).toHaveBeenCalledTimes(2)
  const { data } = handler.mock.calls[0][0] as ProviderMessage
  expect(data).toMatchObject(expectedMessage)
})

test("disconnect sends disconnect message and emits disconnected", async () => {
  const ep = new ExtensionProvider("test", westendSpec)
  const emitted = jest.fn()
  await ep.connect()

  ep.on("disconnected", emitted)
  void ep.disconnect()
  await waitForMessageToBePosted()

  const expectedMessage: Partial<ToExtension> = {
    appName: "test",
    chainName: "Westend",
    action: "disconnect",
    origin: "extension-provider",
  }
  expect(handler).toHaveBeenCalledTimes(3)
  const { data } = handler.mock.calls[2][0] as ProviderMessage
  expect(data).toMatchObject(expectedMessage)
  expect(ep.isConnected).toBe(false)
  expect(emitted).toHaveBeenCalledTimes(1)
})

test("disconnects and emits disconnected when it receives a disconnect message", async () => {
  const ep = new ExtensionProvider("test", westendSpec)
  const emitted = jest.fn()
  await ep.connect()

  ep.on("disconnected", emitted)
  await waitForMessageToBePosted()
  sendMessage({
    origin: "content-script",
    disconnect: true,
  })
  await waitForMessageToBePosted()
  expect(emitted).toHaveBeenCalled()
  expect(ep.isConnected).toBe(false)
})

test("emits error when it receives an error message", async () => {
  const ep = new ExtensionProvider("test", westendSpec)
  await ep.connect()
  await waitForMessageToBePosted()
  const errorMessage: ToApplication = {
    origin: "content-script",
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
