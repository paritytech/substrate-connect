/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { jest } from "@jest/globals"
import { ConnectionManager } from "./ConnectionManager"
import westend from "../../public/assets/westend.json"
import kusama from "../../public/assets/kusama.json"
import { MockPort } from "../mocks"
import { chrome } from "jest-chrome"
import { App } from "./types"
import {
  ToExtensionMessageType,
  ToWebpageMessageType,
} from "@substrate/connect-extension-protocol"

let port: MockPort
let manager: ConnectionManager

const waitForMessageToBePosted = (): Promise<null> => {
  // window.postMessge is async so we must do a short setTimeout to yield to
  // the event loop
  return new Promise((resolve) => setTimeout(resolve, 10, null))
}

const connectApp = (
  manager: ConnectionManager,
  tabId: number,
  name: string,
): MockPort => {
  const port = new MockPort(name)
  port.setTabId(tabId)
  manager.addApp(port)
  return port
}

const doNothing = () => {
  // Do nothing
}

test("adding and removing apps changes state", async () => {
  //setup connection manager with 2 chains
  const manager = new ConnectionManager()
  manager.smoldotLogLevel = 1
  manager.initSmoldot()
  await manager.addChain(JSON.stringify(westend), doNothing)
  await manager.addChain(JSON.stringify(kusama), doNothing)

  const handler = jest.fn()
  manager.on("stateChanged", handler)

  // app connects
  connectApp(manager, 42, "test-app")
  expect(handler).toHaveBeenCalledTimes(1)
  expect(manager.getState()).toEqual({
    apps: [
      {
        name: "test-app",
        tabId: 42,
        networks: [],
      },
    ],
  })

  // different app connects to second network
  handler.mockClear()
  const port = connectApp(manager, 43, "another-app")
  expect(handler).toHaveBeenCalledTimes(1)
  expect(manager.getState()).toEqual({
    apps: [
      {
        name: "test-app",
        tabId: 42,
        networks: [],
      },
      {
        name: "another-app",
        tabId: 43,
        networks: [],
      },
    ],
  })

  // disconnect second app
  handler.mockClear()
  port.triggerDisconnect()
  expect(handler).toHaveBeenCalled()
  expect(manager.getState()).toEqual({
    apps: [
      {
        name: "test-app",
        tabId: 42,
        networks: [],
      },
    ],
  })

  handler.mockClear()
  manager.disconnectTab(42)
  expect(handler).toHaveBeenCalledTimes(1)
  expect(manager.getState()).toEqual({ apps: [] })

  // Connect 2 apps on the same network and 2nd one on another network
  // in order to test disconnectAll functionality
  handler.mockClear()
  // first app connects to network
  connectApp(manager, 1, "test-app-1")
  expect(handler).toHaveBeenCalledTimes(1)
  expect(manager.getState()).toEqual({
    apps: [
      {
        name: "test-app-1",
        tabId: 1,
        networks: [],
      },
    ],
  })

  // second app connects to same network
  handler.mockClear()
  connectApp(manager, 2, "test-app-2")
  expect(handler).toHaveBeenCalledTimes(1)
  expect(manager.getState()).toEqual({
    apps: [
      {
        name: "test-app-1",
        tabId: 1,
        networks: [],
      },
      {
        name: "test-app-2",
        tabId: 2,
        networks: [],
      },
    ],
  })
  handler.mockClear()
  // disconnect all apps;
  manager.disconnectAll()
  expect(handler).toHaveBeenCalledTimes(2)
  expect(manager.getState()).toEqual({ apps: [] })
  await manager.shutdown()
})

test("Tries to connect to a parachain with unknown Relay Chain", async () => {
  const port = new MockPort("test-app-7")
  const manager = new ConnectionManager()
  const handler = jest.fn()

  manager.smoldotLogLevel = 1
  manager.initSmoldot()
  await manager.addChain(JSON.stringify(westend), doNothing)
  manager.on("stateChanged", handler)
  manager.addApp(port)
  await waitForMessageToBePosted()

  port.triggerMessage({
    type: ToExtensionMessageType.Spec,
    payload: {
      relaychain: JSON.stringify(null),
      parachain: JSON.stringify({
        name: "parachainSpec",
        relay_chain: "someRelayChain",
      }),
    },
  })
  await waitForMessageToBePosted()
  expect(port.postMessage).toHaveBeenCalledTimes(1)
  expect((port.postMessage as any).mock.calls[0][0]).toMatchObject({
    type: ToWebpageMessageType.Error,
  })
  expect(port.disconnect).toHaveBeenCalled()

  await manager.shutdown()
})

describe("Unit tests", () => {
  const manager = new ConnectionManager()
  const handler = jest.fn()

  beforeAll(async () => {
    manager.smoldotLogLevel = 1
    //setup connection manager with 2 networks
    manager.initSmoldot()
    await manager.addChain(JSON.stringify(westend), doNothing)
    await manager.addChain(JSON.stringify(kusama), doNothing)
    manager.on("stateChanged", handler)

    //add 4 apps in clients
    connectApp(manager, 11, "test-app-1")
    connectApp(manager, 12, "test-app-2")
    connectApp(manager, 13, "test-app-3")
    connectApp(manager, 14, "test-app-4")
  })

  afterAll(async () => {
    await manager.shutdown()
  })

  test("Get registered apps", () => {
    expect(manager.registeredApps).toEqual([
      "test-app-1",
      "test-app-2",
      "test-app-3",
      "test-app-4",
    ])
  })

  test("Get apps", () => {
    expect(manager.apps).toHaveLength(4)
  })

  test("Adding an app that already exists sends an error and disconnects", () => {
    const port = connectApp(manager, 13, "test-app-3")
    expect(port.postMessage).toHaveBeenCalledTimes(1)
    expect(port.postMessage).toHaveBeenLastCalledWith({
      type: ToWebpageMessageType.Error,
      payload: "App test-app-3 already exists.",
    })
    expect(port.disconnect).toHaveBeenCalled()
  })
})

describe("When the manager is shutdown", () => {
  const manager = new ConnectionManager()

  beforeEach(() => {
    manager.smoldotLogLevel = 1
    manager.initSmoldot()
  })

  test("adding an app after the manager is shutdown throws an error", async () => {
    const port = new MockPort("test-app-5")
    port.setTabId(15)
    await expect(async () => {
      await manager.shutdown()
      manager.addApp(port)
    }).rejects.toThrowError("Smoldot client does not exist.")
  })
})

describe("Check storage and send notification when adding an app", () => {
  const westendPayload = JSON.stringify({ name: "Westend", id: "westend2" })
  const port = new MockPort("test-app-7")
  const manager = new ConnectionManager()
  const handler = jest.fn()
  let app: App

  chrome.storage.sync.get.mockImplementation((keys, callback) => {
    callback({ notifications: true })
  })

  beforeEach(() => {
    chrome.storage.sync.get.mockClear()
    chrome.notifications.create.mockClear()
  })

  beforeAll(async () => {
    manager.smoldotLogLevel = 1
    manager.initSmoldot()
    await manager.addChain(JSON.stringify(westend), doNothing)
    await manager.addChain(JSON.stringify(kusama), doNothing)
    manager.on("stateChanged", handler)

    manager.addApp(port)
    await waitForMessageToBePosted()
  })

  afterAll(async () => {
    await manager.shutdown()
  })

  test("Checks storage for notifications preferences", () => {
    port.triggerMessage({
      type: ToExtensionMessageType.Spec,
      payload: { relaychain: westendPayload },
    })
    expect(chrome.storage.sync.get).toHaveBeenCalledTimes(1)
  })

  test("Sends a notification", () => {
    port.triggerMessage({
      type: ToExtensionMessageType.Spec,
      payload: { relaychain: westendPayload },
    })
    const notificationData = {
      message: "App test-app-7 connected to Westend.",
      title: "Substrate Connect",
      iconUrl: "./icons/icon-32.png",
      type: "basic",
    }

    expect(chrome.notifications.create).toHaveBeenCalledTimes(1)
    expect(chrome.notifications.create).toHaveBeenCalledWith(
      "test-app-7",
      notificationData,
    )
  })
})

describe("Tests with actual ConnectionManager", () => {
  let app: App
  beforeEach(() => {
    port = new MockPort("test-app")
    manager = new ConnectionManager()
    app = manager.createApp(port)
  })

  test("Construction parses the port name and gets port information", () => {
    expect(app.name).toBe("test-app")
    expect(app.appName).toBe("test-app")
    expect(app.url).toBe(port.sender.url)
    expect(app.tabId).toBe(port.sender.tab.id)
  })

  test("Connected state", () => {
    app = manager.createApp(port)
    port.triggerMessage({
      type: ToExtensionMessageType.Spec,
      payload: { relaychain: "westend" },
    })
    port.triggerMessage({
      type: ToExtensionMessageType.Rpc,
      payload: '{ "id": 1 }',
    })

    expect(app.state).toBe("connected")
  })

  test("Disconnect cleans up properly", async () => {
    app = manager.createApp(port)
    port.triggerMessage({
      type: ToExtensionMessageType.Spec,
      payload: { relaychain: "westend" },
    })
    await waitForMessageToBePosted()
    manager.disconnect(app)
    await waitForMessageToBePosted()
    expect(app.state).toBe("disconnected")
  })

  test("Connected state", () => {
    port.triggerMessage({
      type: ToExtensionMessageType.Spec,
      payload: { relaychain: "westend" },
    })
    port.triggerMessage({
      type: ToExtensionMessageType.Rpc,
      payload: '{ "id": 1 }',
    })
    expect(app.state).toBe("connected")
  })

  test("Smoldot throws error when it does not exist", async () => {
    try {
      await manager.addChain(JSON.stringify(kusama), doNothing)
    } catch (err: any) {
      expect(err.message).toBe("Smoldot client does not exist.")
    }
  })

  test("Spec message adds a chain", async () => {
    port.triggerMessage({
      type: ToExtensionMessageType.Spec,
      payload: { relaychain: "westend" },
    })
    await waitForMessageToBePosted()
    expect(app.healthChecker).toBeDefined()
  })

  test("Buffers RPC messages before spec message", async () => {
    const message1 = JSON.stringify({ id: 1, jsonrpc: "2.0", result: {} })
    port.triggerMessage({ type: ToExtensionMessageType.Rpc, payload: message1 })
    const message2 = JSON.stringify({ id: 2, jsonrpc: "2.0", result: {} })
    port.triggerMessage({ type: ToExtensionMessageType.Rpc, payload: message2 })
    port.triggerMessage({
      type: ToExtensionMessageType.Spec,
      payload: { relaychain: "westend" },
    })
    await waitForMessageToBePosted()
    expect(app.healthChecker).toBeDefined()
  })

  test("RPC port message sends the message to the chain", async () => {
    port.triggerMessage({
      type: ToExtensionMessageType.Spec,
      payload: { relaychain: "westend" },
    })
    await waitForMessageToBePosted()
    const message = JSON.stringify({ id: 1, jsonrpc: "2.0", result: {} })
    port.triggerMessage({ type: ToExtensionMessageType.Rpc, payload: message })
    await waitForMessageToBePosted()
  })

  test("App already disconnected", async () => {
    app = manager.createApp(port)
    port.triggerMessage({
      type: ToExtensionMessageType.Spec,
      payload: { relaychain: "westend" },
    })
    await waitForMessageToBePosted()
    manager.disconnect(app)
    await waitForMessageToBePosted()
    expect(() => {
      manager.disconnect(app)
    }).toThrowError("Cannot disconnect - already disconnected")
  })
})
