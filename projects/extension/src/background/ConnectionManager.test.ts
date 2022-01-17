/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { jest } from "@jest/globals"
import { ConnectionManager } from "./ConnectionManager"
import { ExposedChainConnection } from "./types"
import { MockedChain, MockPort, MockSmoldotClient, TEST_URL } from "../mocks"
import { ToExtension } from "@substrate/connect-extension-protocol"

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms))

const createHelper = () => {
  const client = new MockSmoldotClient()
  const manager = new ConnectionManager(client)

  return {
    manager,
    client,
    connectPort: (
      chainId: string,
      tabId: number,
      addChainMsg: Omit<ToExtension, "origin" | "chainId"> | null = null,
      url = TEST_URL,
    ) => {
      const port = new MockPort(chainId, tabId)
      manager.addChainConnection(port)

      let chain: MockedChain | null = null
      if (addChainMsg) {
        port._sendExtensionMessage(addChainMsg)
        const chains = [...client.chains]
        chain = chains[chains.length - 1]
      }

      return {
        chainId,
        tabId,
        url,
        port,
        chain,
      }
    },
  }
}

describe("ConnectionManager", () => {
  let helper: ReturnType<typeof createHelper>
  const originalError = console.error
  beforeEach(() => {
    helper = createHelper()
    console.error = jest.fn()
  })
  afterEach(() => {
    console.error = originalError
    helper.manager.shutdown()
  })

  it("it emits after the add-chain message has been posted", async () => {
    const { client, manager, connectPort } = helper
    const onStateChanged = jest.fn()
    manager.on("stateChanged", onStateChanged)

    const { chainId, tabId, port, url } = connectPort("chainId", 1)

    expect(client.chains.size).toBe(0)
    expect(manager.connections.length).toBe(0)
    expect(onStateChanged).not.toHaveBeenCalled()

    port._sendExtensionMessage({
      type: "add-well-known-chain",
      payload: "polkadot",
    })

    await wait(0)

    const expectedConnection: ExposedChainConnection = {
      chainId,
      tabId,
      chainName: "polkadot",
      url,
      healthStatus: undefined,
    }

    expect(onStateChanged).toHaveBeenCalledWith([expectedConnection])
    expect(manager.connections).toEqual([expectedConnection])
    expect(client.chains.size).toBe(1)
    expect(port.postedMessages.length).toBe(0)
  })

  it("does not emit if the port gets disconnected before the chain has been instantiated", async () => {
    const { client, manager, connectPort } = helper
    const onStateChanged = jest.fn()
    manager.on("stateChanged", onStateChanged)

    const { port } = connectPort("chainId", 1)

    expect(client.chains.size).toBe(0)
    expect(manager.connections.length).toBe(0)
    expect(onStateChanged).not.toHaveBeenCalled()
    expect(port.connected).toBe(true)

    port.disconnect()
    await wait(0)

    expect(onStateChanged).not.toHaveBeenCalled()
    expect(manager.connections).toEqual([])
    expect(client.chains.size).toBe(0)
    expect(port.postedMessages.length).toBe(0)
  })

  it("receives a system_health request from the health-checker immediately after the chain is instantiated", async () => {
    const { connectPort, client } = helper

    const { port } = connectPort("chainId", 1)

    expect(client.chains.size).toBe(0)

    port._sendExtensionMessage({
      type: "add-well-known-chain",
      payload: "polkadot",
    })
    await wait(0)

    expect(client.chains.size).toBe(1)

    const [chain] = [...client.chains]

    expect(chain.receivedMessages).toEqual([
      '{"jsonrpc":"2.0","id":"health-checker:0","method":"system_health","params":[]}',
    ])
  })

  it("the 'rpc' messages received before 'add-chain' get processed as soon as the chain is instantiated", async () => {
    const { connectPort, client } = helper

    const { port } = connectPort("chainId", 1)

    expect(client.chains.size).toBe(0)

    port._sendExtensionMessage({
      type: "rpc",
      payload: JSON.stringify({ jsonrpc: "2.0", id: "1" }),
    })

    port._sendExtensionMessage({
      type: "rpc",
      payload: JSON.stringify({ jsonrpc: "2.0", id: "2" }),
    })

    port._sendExtensionMessage({
      type: "add-well-known-chain",
      payload: "polkadot",
    })
    await wait(0)

    const [chain] = [...client.chains]
    expect(chain.receivedMessages).toEqual([
      '{"jsonrpc":"2.0","id":"health-checker:0","method":"system_health","params":[]}',
      '{"jsonrpc":"2.0","id":"extern:\\"1\\""}',
      '{"jsonrpc":"2.0","id":"extern:\\"2\\""}',
    ])
  })

  it("passes the messages from the chain to the port", async () => {
    const { connectPort } = helper

    const { port, chain } = connectPort("chainId", 1, {
      type: "add-well-known-chain",
      payload: "polkadot",
    })

    await wait(0)

    port._sendExtensionMessage({
      type: "rpc",
      payload: JSON.stringify({ jsonrpc: "2.0", id: "1" }),
    })

    await wait(0)

    expect(chain!.receivedMessages).toEqual([
      '{"jsonrpc":"2.0","id":"health-checker:0","method":"system_health","params":[]}',
      '{"jsonrpc":"2.0","id":"extern:\\"1\\""}',
    ])
    expect(port.postedMessages).toEqual([])

    chain!._sendResponse(
      JSON.stringify({
        jsonrpc: "2.0",
        id: 'extern:"1"',
        result: "{}",
      }),
    )

    await wait(0)

    expect(port.postedMessages).toEqual([
      {
        type: "rpc",
        payload: JSON.stringify({
          jsonrpc: "2.0",
          id: "1",
          result: "{}",
        }),
      },
    ])
  })

  it("correctly errors when passed a malformed message", () => {
    const { connectPort } = helper
    const { port } = connectPort("chainId", 1)

    port._sendExtensionMessage({
      type: "foo" as "rpc",
      payload: "",
    })

    expect(port.postedMessages).toEqual([
      {
        type: "error",
        payload: `Unrecognised message type 'foo' or payload '' received from content script`,
      },
    ])
  })

  it("correctly errors when passed a wrong well-known-chain", async () => {
    const { connectPort } = helper
    const { port } = connectPort("chainId", 1, {
      type: "add-well-known-chain",
      payload: "nonexisting",
    })

    await wait(0)

    expect(port.postedMessages).toEqual([
      {
        type: "error",
        payload: "Relay chain spec was not found",
      },
    ])
  })

  it("emits the correct state when it receives a health update", async () => {
    const { manager, connectPort } = helper
    const onStateChanged = jest.fn()
    manager.on("stateChanged", onStateChanged)

    const { chain, chainId, tabId, url } = connectPort("chainId", 1, {
      type: "add-well-known-chain",
      payload: "polkadot",
    })

    await wait(0)

    const expectedConnection: ExposedChainConnection = {
      chainId,
      tabId,
      chainName: "polkadot",
      url,
      healthStatus: undefined,
    }

    expect(onStateChanged).toHaveBeenCalledWith([expectedConnection])
    onStateChanged.mockReset()

    const healthStatus = {
      isSyncing: false,
      peers: 1,
      shouldHavePeers: true,
    }

    chain!._sendResponse(
      JSON.stringify({
        jsonrpc: "2.0",
        id: "health-checker:0",
        result: healthStatus,
      }),
    )

    await wait(0)

    expect(onStateChanged).toHaveBeenCalledWith([
      { ...expectedConnection, healthStatus },
    ])
  })

  it("disconnecting a tab disconnects the ports of the tab and emits the new state", async () => {
    const { connectPort, manager } = helper
    const onStateChanged = jest.fn()
    manager.on("stateChanged", onStateChanged)

    // This emulates 3 active tabs, with 3 connections each
    const connections = Array(9)
      .fill(null)
      .map((_, idx) => idx)
      .map((idx) => {
        const tabId = Math.floor(idx / 3)
        return connectPort(idx.toString(), tabId, {
          type: "add-well-known-chain",
          payload: "polkadot",
        })
      })
    await wait(0)

    const expectedChainConnections: ExposedChainConnection[] = connections.map(
      (data) => ({
        chainId: data.chainId,
        tabId: data.tabId,
        url: data.url,
        chainName: "polkadot",
        healthStatus: undefined,
      }),
    )

    expect(onStateChanged).toHaveBeenCalledTimes(1)
    expect(onStateChanged).toHaveBeenCalledWith(expectedChainConnections)
    expect(connections.every((data) => data.port.connected === true)).toBe(true)

    onStateChanged.mockReset()
    manager.disconnectTab(0)
    await wait(0)

    expect(onStateChanged).toHaveBeenCalledTimes(1)
    expect(onStateChanged).toHaveBeenCalledWith(
      expectedChainConnections.filter((c) => c.tabId !== 0),
    )
    expect(
      connections.every((data) => data.port.connected === data.tabId > 0),
    ).toBe(true)
  })

  it("passes the relay-chains of its tab as the potentialRelayChains when instantiating a new chain", async () => {
    const { connectPort } = helper

    // This emulates 3 active tabs, where the 2 first chains of each tab
    // are relayChains anre the 3rd one of that tab is a para-chain
    const activeChains = Array(9)
      .fill(null)
      .map((_, idx) => idx)
      .map((idx) => {
        const tabId = Math.floor(idx / 3)
        const { chain } = connectPort(idx.toString(), tabId, {
          type: "add-well-known-chain",
          payload: "polkadot",
          parachainPayload:
            idx % 3 === 2
              ? JSON.stringify({ name: `parachain${idx}` })
              : undefined,
        })
        return chain
      })

    await wait(0)

    const { chain: newChain } = connectPort("lastOne", 0, {
      type: "add-well-known-chain",
      payload: "polkadot",
    })

    await wait(0)

    expect(newChain!.options.potentialRelayChains).toEqual([
      activeChains[0],
      activeChains[1],
    ])
  })

  it("disconnects and removes the smoldot instance on shutdown", async () => {
    const { manager, connectPort } = helper
    await manager.shutdown()

    expect(() => connectPort("boom", 0)).toThrow(
      "Smoldot client does not exist.",
    )
    expect(() => manager.addChain("")).toThrow("Smoldot client does not exist.")
  })
})
