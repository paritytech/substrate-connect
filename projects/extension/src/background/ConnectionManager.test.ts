/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { jest } from "@jest/globals"
import { ConnectionManager } from "./ConnectionManager"
import { ExposedChainConnection } from "./types"
import {
  MockedChain,
  MockPort,
  MockSmoldotClient,
  TEST_URL,
  HeaderlessToExtension,
} from "../mocks"
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
      addChainMsg?: HeaderlessToExtension<ToExtension>,
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
      chainName: "polkadot",
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
    expect(port.postedMessages.length).toBe(1)
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
      chainName: "polkadot",
    })
    await wait(0)

    expect(client.chains.size).toBe(1)

    const [chain] = [...client.chains]

    expect(chain.receivedMessages).toEqual([
      '{"jsonrpc":"2.0","id":"health-checker:0","method":"system_health","params":[]}',
    ])
  })

  it("sending an 'rpc' message before the chain is added triggers an error", async () => {
    const { connectPort, client } = helper

    const { port } = connectPort("chainId", 1)

    expect(client.chains.size).toBe(0)

    port._sendExtensionMessage({
      type: "add-well-known-chain",
      chainName: "polkadot",
    })

    port._sendExtensionMessage({
      type: "rpc",
      jsonRpcMessage: JSON.stringify({ jsonrpc: "2.0", id: "1" }),
    })

    await wait(0)

    expect(port.postedMessages).toEqual([
      {
        type: "error",
        payload: "RPC request received befor the chain was successfully added",
      },
    ])
  })

  it("passes the messages from the chain to the port", async () => {
    const { connectPort } = helper

    const { port, chain } = connectPort("chainId", 1, {
      type: "add-well-known-chain",
      chainName: "polkadot",
    })

    await wait(0)

    port._sendExtensionMessage({
      type: "rpc",
      jsonRpcMessage: JSON.stringify({ jsonrpc: "2.0", id: "1" }),
    })

    await wait(0)

    expect(chain!.receivedMessages).toEqual([
      '{"jsonrpc":"2.0","id":"health-checker:0","method":"system_health","params":[]}',
      '{"jsonrpc":"2.0","id":"extern:\\"1\\""}',
    ])
    expect(port.postedMessages).toEqual([
      {
        type: "chain-ready",
      },
    ])

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
        type: "chain-ready",
      },
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
      jsonRpcMessage: "",
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
      chainName: "nonexisting",
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
      chainName: "polkadot",
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
          chainName: "polkadot",
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

  it("passes the correct relay-chains of its tab as the potentialRelayChains when instantiating a new chain", async () => {
    const { connectPort } = helper

    // This emulates 3 active tabs with 3 well-known-chains in each
    const allIds = Array(9)
      .fill(null)
      .map((_, idx) => idx)

    const activeChains = allIds.map((idx) => {
      const tabId = Math.floor(idx / 3)
      const { chain } = connectPort(idx.toString(), tabId, {
        type: "add-well-known-chain",
        chainName: "polkadot",
      })
      return chain
    })

    await wait(0)

    // we will try to pass all the ids as potentialRelayChainIds, including
    // the ones that are not in our tab
    const { chain: newChain } = connectPort("lastOne", 0, {
      type: "add-chain",
      chainSpec: JSON.stringify({ name: "parachain" }),
      potentialRelayChainIds: allIds.map((id) => id.toString()),
    })

    await wait(0)

    // now we make usre that the only potentialRelayChains that are passed to
    // smoldot are the ones for the chains of our tab
    expect(newChain!.options.potentialRelayChains).toEqual([
      activeChains[0],
      activeChains[1],
      activeChains[2],
    ])
  })

  it("disconnects and removes the smoldot instance on shutdown", async () => {
    const { manager, connectPort } = helper
    await manager.shutdown()

    expect(() => connectPort("boom", 0)).toThrow(
      "Smoldot client does not exist.",
    )
    expect(() => manager.addChain("", [])).toThrow(
      "Smoldot client does not exist.",
    )
  })

  it("handles two different tabs using the same chainId", async () => {
    const { connectPort } = helper
    const chainId = "same"

    const { chain: tab1Chain, port: tab1Port } = connectPort(chainId, 1, {
      type: "add-well-known-chain",
      chainName: "polkadot",
    })

    const { chain: tab2Chain, port: tab2Port } = connectPort(chainId, 2, {
      type: "add-well-known-chain",
      chainName: "polkadot",
    })

    await wait(0)

    expect(tab1Chain).not.toBe(tab2Chain)
    expect(tab1Chain!.receivedMessages.length).toBe(1)
    expect(tab2Chain!.receivedMessages.length).toBe(1)

    // let's make sure that each chain receives *only* their own messages
    tab1Port._sendExtensionMessage({
      type: "rpc",
      jsonRpcMessage: JSON.stringify({ jsonrpc: "2.0", id: "ping1" }),
    })

    tab2Port._sendExtensionMessage({
      type: "rpc",
      jsonRpcMessage: JSON.stringify({ jsonrpc: "2.0", id: "ping2" }),
    })

    await wait(0)
    expect(tab1Chain!.receivedMessages.length).toBe(2)
    expect(tab2Chain!.receivedMessages.length).toBe(2)

    let [lastMessage] = tab1Chain!.receivedMessages.slice(-1)
    expect(lastMessage).toBe('{"jsonrpc":"2.0","id":"extern:\\"ping1\\""}')
    ;[lastMessage] = tab2Chain!.receivedMessages.slice(-1)
    expect(lastMessage).toBe('{"jsonrpc":"2.0","id":"extern:\\"ping2\\""}')

    // let's make sure that each port receives *only* their own messages
    expect(tab1Port.postedMessages.length).toBe(1)
    expect(tab2Port.postedMessages.length).toBe(1)

    tab1Chain!._sendResponse(
      JSON.stringify({
        jsonrpc: "2.0",
        id: 'extern:"ping1"',
        result: '"pong1"',
      }),
    )
    tab2Chain!._sendResponse(
      JSON.stringify({
        jsonrpc: "2.0",
        id: 'extern:"ping2"',
        result: '"pong2"',
      }),
    )

    await wait(0)

    expect(tab1Port.postedMessages).toEqual([
      {
        type: "chain-ready",
      },
      {
        type: "rpc",
        payload: JSON.stringify({
          jsonrpc: "2.0",
          id: "ping1",
          result: '"pong1"',
        }),
      },
    ])
    expect(tab2Port.postedMessages).toEqual([
      {
        type: "chain-ready",
      },
      {
        type: "rpc",
        payload: JSON.stringify({
          jsonrpc: "2.0",
          id: "ping2",
          result: '"pong2"',
        }),
      },
    ])
  })

  it("immediately removes the chain after receiving it, if the port got disconnected while waiting for the chain", async () => {
    const { connectPort, client } = helper

    const { port } = connectPort("chainId", 1, {
      type: "add-well-known-chain",
      chainName: "polkadot",
    })

    expect(client.chains.size).toBe(1)
    port.disconnect()

    // it's still 1 because the `addChain` Promise has not resolved yet
    // so the `ConnectionManager` has not received the chain and therefore
    // cannot yet remove it
    expect(client.chains.size).toBe(1)

    await wait(0)

    expect(client.chains.size).toBe(0)
  })

  it("disconnects and cleans up upon receiving a `remove-chain` message", async () => {
    const { connectPort, client } = helper

    const { port } = connectPort("chainId", 1, {
      type: "add-well-known-chain",
      chainName: "polkadot",
    })

    await wait(0)

    expect(client.chains.size).toBe(1)

    port._sendExtensionMessage({
      type: "remove-chain",
    })

    expect(port.postedMessages).toEqual([
      {
        type: "chain-ready",
      },
    ])
    expect(client.chains.size).toBe(0)
    expect(port.connected).toBe(false)
  })
})
