/*
 * @jest-environment jsdom
 */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { jest } from "@jest/globals"
import { ExtensionProvider } from "./ExtensionProvider"
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
  await ep.connect()
  await waitForMessageToBePosted()

  const expectedMessage: Partial<ToExtension> = {
    origin: "extension-provider",
    payload: '{"name":"Westend","id":"westend2"}',
    type: "add-chain",
  }
  expect(handler).toHaveBeenCalledTimes(1)
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
  await ep1.connect()
  await waitForMessageToBePosted()
  await ep2.connect()
  await waitForMessageToBePosted()

  const expectedMessage1: Partial<ToExtension> = {
    origin: "extension-provider",
    payload: '{"name":"Westend","id":"westend2"}',
    type: "add-chain",
  }
  const expectedMessage2: Partial<ToExtension> = {
    origin: "extension-provider",
    payload: '{"name":"Rococo","id":"rococo"}',
    type: "add-chain",
  }

  expect(handler).toHaveBeenCalledTimes(2)
  const data1 = handler.mock.calls[0][0] as MessageEvent
  const data2 = handler.mock.calls[1][0] as MessageEvent
  expect(data1.data).toMatchObject(expectedMessage1)
  expect(data2.data).toMatchObject(expectedMessage2)
})

test("connected parachain sends correct spec message", async () => {
  const ep = new ExtensionProvider(westendSpec)
  const emitted = jest.fn()
  ep.on("connected", emitted)
  await ep.connect()
  await waitForMessageToBePosted()

  const expectedMessage: Partial<ToExtension> = {
    origin: "extension-provider",
    payload: '{"name":"Westend","id":"westend2"}',
    type: "add-chain",
  }
  expect(handler).toHaveBeenCalledTimes(1)
  const { data } = handler.mock.calls[0][0] as MessageEvent
  expect(data).toMatchObject(expectedMessage)
})

test("disconnect sends disconnect message and emits disconnected", async () => {
  const ep = new ExtensionProvider(westendSpec)
  const emitted = jest.fn()
  await ep.connect()

  ep.on("disconnected", emitted)
  void ep.disconnect()
  await waitForMessageToBePosted()

  expect(ep.isConnected).toBe(false)
  expect(emitted).toHaveBeenCalledTimes(1)
})

test("disconnects and emits an error when it receives an error message", async () => {
  const ep = new ExtensionProvider(westendSpec)
  const emitted = jest.fn()
  await ep.connect()

  ep.on("error", emitted)
  await waitForMessageToBePosted()
  sendMessage({
    origin: "content-script",
    type: "error",
    payload: "disconnected",
  })
  await waitForMessageToBePosted()
  expect(emitted).toHaveBeenCalled()
  expect(ep.isConnected).toBe(false)
})

test("emits error when it receives an error message", async () => {
  const ep = new ExtensionProvider(westendSpec)
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
