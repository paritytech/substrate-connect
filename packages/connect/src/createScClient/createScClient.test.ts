import { jest } from "@jest/globals"
import { CrashError } from "../connector/index.js"
import type { Chain, JsonRpcCallback } from "../connector/types.js"
import type { ScClient } from "./createScClient.js"

type MockChain = Chain & {
  _spec: () => string
  _recevedRequests: () => string[]
  _isTerminated: () => boolean
  _triggerCallback: (response: string | {}) => void
  _setTerminateInterceptor: (fn: () => void) => void
  _setSendJsonRpcInterceptor: (fn: (rpc: string) => void) => void
  _getLatestRequest: () => string
}

const getFakeChain = (spec: string, callback: JsonRpcCallback): MockChain => {
  const _receivedRequests: string[] = []
  let _isTerminated = false

  let terminateInterceptor: Function = Function.prototype
  let sendJsonRpcInterceptor: Function = Function.prototype

  return {
    _spec: () => spec,
    _recevedRequests: () => _receivedRequests,
    _isTerminated: () => _isTerminated,
    _triggerCallback: (response) => {
      callback(
        typeof response === "string" ? response : JSON.stringify(response),
      )
    },
    _setSendJsonRpcInterceptor: (fn) => {
      sendJsonRpcInterceptor = fn
    },
    _setTerminateInterceptor: (fn) => {
      terminateInterceptor = fn
    },
    sendJsonRpc: (rpc) => {
      sendJsonRpcInterceptor(rpc)
      _receivedRequests.push(rpc)
    },
    remove: () => {
      terminateInterceptor()
      _isTerminated = true
    },
    _getLatestRequest: () => _receivedRequests[_receivedRequests.length - 1],
  }
}

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms))

const getFakeClient = () => {
  const chains: MockChain[] = []
  let addChainInterceptor: Promise<void> = Promise.resolve()
  let addWellKnownChainInterceptor: Promise<void> = Promise.resolve()

  return {
    _chains: () => chains,
    _setAddChainInterceptor: (interceptor: Promise<void>) => {
      addChainInterceptor = interceptor
    },
    _setAddWellKnownChainInterceptor: (interceptor: Promise<void>) => {
      addWellKnownChainInterceptor = interceptor
    },
    addChain: (chainSpec: string, cb: JsonRpcCallback): Promise<MockChain> =>
      addChainInterceptor.then(() => {
        const result = getFakeChain(chainSpec, cb)
        chains.push(result)
        return result
      }),
    addWellKnownChain: (
      wellKnownChain: string,
      cb: JsonRpcCallback,
    ): Promise<MockChain> =>
      addWellKnownChainInterceptor.then(() => {
        const result = getFakeChain(wellKnownChain, cb)
        chains.push(result)
        return result
      }),
  }
}

const connectorFactory = () => {
  const clients: ReturnType<typeof getFakeClient>[] = []
  const latestClient = () => clients[clients.length - 1]
  return {
    getConnectorClient: () => {
      const result = getFakeClient()
      clients.push(result)
      return result
    },
    _clients: () => clients,
    latestClient,
    latestChain: () =>
      latestClient()._chains()[latestClient()._chains().length - 1],
  }
}

jest.unstable_mockModule("../connector/index.js", connectorFactory)

let createScClient: () => ScClient
let mockedConnector: ReturnType<typeof connectorFactory>
beforeAll(async () => {
  ;({ createScClient } = await import("./createScClient"))
  mockedConnector = (await import(
    "../connector/index.js"
  )) as unknown as ReturnType<typeof connectorFactory>
})

describe("createChain/createWellKnownCahin", () => {
  it("returns the Provider once the chain Promise is resolved", async () => {
    const client = createScClient()

    let onResolveChain: Function = () => {}
    mockedConnector.latestClient()._setAddWellKnownChainInterceptor(
      new Promise((res) => {
        onResolveChain = res
      }),
    )

    let resolved = false
    client.addWellKnownChain("test" as any).then(() => {
      resolved = true
    })

    await wait(100)

    expect(resolved).toBe(false)

    onResolveChain()
    await wait(0)

    expect(resolved).toBe(true)
    expect(mockedConnector.latestChain()._spec()).toEqual("test")
  })

  it("rejects when smoldot can't create the underlying chain", async () => {
    const client = createScClient()

    mockedConnector
      .latestClient()
      ._setAddChainInterceptor(Promise.reject(new Error("boom!")))

    await expect(client.addChain("test")).rejects.toThrowError("boom!")
  })
})

describe("Provider", () => {
  describe("on", () => {
    it("emits `connected` as soon as the chain is not syncing", async () => {
      const client = createScClient()

      const provider = await client.addChain("")

      const onConnected = jest.fn()
      provider.on("connected", onConnected)

      await wait(100)
      expect(onConnected).not.toHaveBeenCalled()

      const chain = mockedConnector.latestChain()
      chain._triggerCallback({
        jsonrpc: "2.0",
        id: "health-checker:0",
        result: {
          isSyncing: false,
          peers: 1,
          shouldHavePeers: true,
        },
      })
      expect(onConnected).toHaveBeenCalled()
    })

    it("stops receiving notifications after unsubscribing", async () => {
      const client = createScClient()

      const provider = await client.addChain("")

      const onConnected = jest.fn()
      provider.on("connected", onConnected)()

      await wait(100)
      expect(onConnected).not.toHaveBeenCalled()

      const chain = mockedConnector.latestChain()
      chain._triggerCallback({
        jsonrpc: "2.0",
        id: "health-checker:0",
        result: {
          isSyncing: false,
          peers: 1,
          shouldHavePeers: true,
        },
      })
      expect(onConnected).not.toHaveBeenCalled()
    })

    it("synchronously emits connected if the Provider is already `connected`", async () => {
      const client = createScClient()

      const provider = await client.addChain("")

      const chain = mockedConnector.latestChain()
      chain._triggerCallback({
        jsonrpc: "2.0",
        id: "health-checker:0",
        result: {
          isSyncing: false,
          peers: 1,
          shouldHavePeers: true,
        },
      })

      const onConnected = jest.fn()
      provider.on("connected", onConnected)
      expect(onConnected).toHaveBeenCalled()
    })

    it("emits `disconnected` once the chain goes back to syncing", async () => {
      const client = createScClient()

      const provider = await client.addChain("")

      const chain = mockedConnector.latestChain()
      chain._triggerCallback({
        jsonrpc: "2.0",
        id: "health-checker:0",
        result: {
          isSyncing: false,
          peers: 1,
          shouldHavePeers: true,
        },
      })

      const onConnected = jest.fn()
      provider.on("connected", onConnected)
      const onDisconnected = jest.fn()
      provider.on("disconnected", onDisconnected)

      expect(onConnected).toHaveBeenCalled()
      expect(onDisconnected).not.toHaveBeenCalled()

      onConnected.mockRestore()
      await wait(1000)

      chain._triggerCallback({
        jsonrpc: "2.0",
        id: "health-checker:1",
        result: {
          isSyncing: true,
          peers: 1,
          shouldHavePeers: true,
        },
      })

      expect(onConnected).not.toHaveBeenCalled()
      expect(onDisconnected).toHaveBeenCalled()
    })
  })

  describe("hasSubscriptions", () => {
    it("supports subscriptions", async () => {
      const client = createScClient()

      const provider = await client.addChain("")
      expect(provider.hasSubscriptions).toBe(true)
    })
  })

  describe("clone", () => {
    it("can not be clonned", async () => {
      const client = createScClient()

      const provider = await client.addChain("")
      expect(() => provider.clone()).toThrowError()
    })
  })

  describe("connect", () => {
    it("does not create a new chain when trying to re-connect while the current chain is syncing", async () => {
      const client = createScClient()
      const provider = await client.addChain("")
      const chain = mockedConnector.latestChain()
      await provider.connect()
      expect(chain).toBe(mockedConnector.latestChain())
    })

    it("throws when trying to connect on an already connected Provider", async () => {
      const client = createScClient()
      const provider = await client.addChain("")
      const chain = mockedConnector.latestChain()
      chain._triggerCallback({
        jsonrpc: "2.0",
        id: "health-checker:0",
        result: {
          isSyncing: false,
          peers: 1,
          shouldHavePeers: true,
        },
      })
      await wait(0)

      await expect(provider.connect()).rejects.toThrowError(
        "Already connected!",
      )
    })
  })

  describe("disconnect", () => {
    it("removes the chain and cleans up", async () => {
      const client = createScClient()
      const provider = await client.addChain("")
      const chain = mockedConnector.latestChain()

      await provider.disconnect()

      expect(chain._isTerminated()).toBe(true)
    })

    it("does not throw when disconnecting on an already disconnected Provider", async () => {
      const client = createScClient()
      const provider = await client.addChain("")

      await provider.disconnect()
      await expect(provider.disconnect()).resolves.not.toThrow()
    })
  })

  describe("send", () => {
    it("throws when trying to send a request while the Provider is not connected", async () => {
      const client = createScClient()
      const provider = await client.addChain("")
      await expect(provider.send("", [])).rejects.toThrow()
    })

    it("receives responses to its requests", async () => {
      const client = createScClient()
      const provider = await client.addChain("")
      const chain = mockedConnector.latestChain()
      chain._triggerCallback({
        jsonrpc: "2.0",
        id: "health-checker:0",
        result: {
          isSyncing: false,
          peers: 1,
          shouldHavePeers: true,
        },
      })

      const responsePromise = provider.send("getData", ["foo"])

      await wait(0)
      expect(chain._getLatestRequest()).toEqual(
        '{"id":"extern:1","jsonrpc":"2.0","method":"getData","params":["foo"]}',
      )

      const result = { foo: "foo" }
      chain._triggerCallback({
        jsonrpc: "2.0",
        id: "extern:1",
        result,
      })

      const response = await responsePromise
      expect(response).toEqual(result)
    })

    it("rejects when the response can't be deserialized", async () => {
      const client = createScClient()
      const provider = await client.addChain("")
      const chain = mockedConnector.latestChain()
      chain._triggerCallback({
        jsonrpc: "2.0",
        id: "health-checker:0",
        result: {
          isSyncing: false,
          peers: 1,
          shouldHavePeers: true,
        },
      })
      await wait(0)

      setTimeout(() => {
        chain._triggerCallback({
          jsonrpc: "2.0",
          id: "extern:1",
        })
      }, 0)

      await expect(provider.send("getData", ["foo"])).rejects.toThrow()
    })

    it("rejects when the smoldot chain has crashed", async () => {
      const client = createScClient()
      const provider = await client.addChain("")
      const chain = mockedConnector.latestChain()
      chain._triggerCallback({
        jsonrpc: "2.0",
        id: "health-checker:0",
        result: {
          isSyncing: false,
          peers: 1,
          shouldHavePeers: true,
        },
      })
      await wait(0)

      chain._setSendJsonRpcInterceptor(() => {
        throw new CrashError("boom!")
      })

      await expect(provider.send("getData", ["foo"])).rejects.toThrow()
      expect(provider.isConnected).toBe(false)
    })
  })

  describe("subscribe", () => {
    it("subscribes and recives messages until it unsubscribes", async () => {
      const client = createScClient()
      const provider = await client.addChain("")
      const chain = mockedConnector.latestChain()
      chain._triggerCallback({
        jsonrpc: "2.0",
        id: "health-checker:0",
        result: {
          isSyncing: false,
          peers: 1,
          shouldHavePeers: true,
        },
      })
      await wait(0)

      const unsubscribeToken = "unsubscribeToken"
      setTimeout(() => {
        chain._triggerCallback({
          jsonrpc: "2.0",
          id: "extern:1",
          result: unsubscribeToken,
        })
      }, 0)

      const cb = jest.fn()
      const token = await provider.subscribe("foo", "bar", ["baz"], cb)

      expect(token).toBe(unsubscribeToken)
      expect(cb).not.toHaveBeenCalled()

      chain._triggerCallback({
        jsonrpc: "2.0",
        method: "foo",
        params: {
          result: 1,
          subscription: token,
        },
      })
      expect(cb).toHaveBeenCalledTimes(1)
      expect(cb).toHaveBeenLastCalledWith(null, 1)

      chain._triggerCallback({
        jsonrpc: "2.0",
        method: "foo",
        params: {
          result: 2,
          subscription: token,
        },
      })
      expect(cb).toHaveBeenCalledTimes(2)
      expect(cb).toHaveBeenLastCalledWith(null, 2)

      provider.unsubscribe("foo", "bar", unsubscribeToken)

      chain._triggerCallback({
        jsonrpc: "2.0",
        method: "foo",
        params: {
          result: 3,
          subscription: token,
        },
      })
      expect(cb).toHaveBeenCalledTimes(2)
      expect(cb).toHaveBeenLastCalledWith(null, 2)
    })

    it("delivers subscription messages that were received before the subscription token", async () => {
      const client = createScClient()
      const provider = await client.addChain("")
      const chain = mockedConnector.latestChain()
      chain._triggerCallback({
        jsonrpc: "2.0",
        id: "health-checker:0",
        result: {
          isSyncing: false,
          peers: 1,
          shouldHavePeers: true,
        },
      })
      await wait(0)

      const unsubscribeToken = "unsubscribeToken"
      chain._triggerCallback({
        jsonrpc: "2.0",
        method: "foo",
        params: {
          result: 1,
          subscription: unsubscribeToken,
        },
      })
      setTimeout(() => {
        chain._triggerCallback({
          jsonrpc: "2.0",
          id: "extern:1",
          result: unsubscribeToken,
        })
      }, 0)

      const cb = jest.fn()
      const token = await provider.subscribe("foo", "bar", ["baz"], cb)

      expect(token).toBe(unsubscribeToken)
      expect(cb).toHaveBeenCalledTimes(1)
      expect(cb).toHaveBeenLastCalledWith(null, 1)
    })

    it("emits the error when the message has an error", async () => {
      const client = createScClient()
      const provider = await client.addChain("")
      const chain = mockedConnector.latestChain()
      chain._triggerCallback({
        jsonrpc: "2.0",
        id: "health-checker:0",
        result: {
          isSyncing: false,
          peers: 1,
          shouldHavePeers: true,
        },
      })
      await wait(0)

      const unsubscribeToken = "unsubscribeToken"
      chain._triggerCallback({
        jsonrpc: "2.0",
        method: "foo",
        params: {
          error: "boom",
          subscription: unsubscribeToken,
        },
      })
      setTimeout(() => {
        chain._triggerCallback({
          jsonrpc: "2.0",
          id: "extern:1",
          result: unsubscribeToken,
        })
      }, 0)

      const cb = jest.fn()
      const token = await provider.subscribe("foo", "bar", ["baz"], cb)

      expect(token).toBe(unsubscribeToken)
      expect(cb).toHaveBeenCalledTimes(1)
      expect(cb.mock.lastCall![0]).toBeInstanceOf(Error)
      expect(cb.mock.lastCall![1]).toBe(undefined)
    })
  })

  describe("unsubscribe", () => {
    it("rejects when trying to unsubscribe from un unexisting subscription", async () => {
      const client = createScClient()
      const provider = await client.addChain("")
      const chain = mockedConnector.latestChain()
      chain._triggerCallback({
        jsonrpc: "2.0",
        id: "health-checker:0",
        result: {
          isSyncing: false,
          peers: 1,
          shouldHavePeers: true,
        },
      })
      await wait(0)

      await expect(provider.unsubscribe("", "", "")).rejects.toThrowError(
        "Unable to find active subscription=::",
      )
    })

    it("rejects when trying to unsubscribe from un unexisting subscription", async () => {
      const client = createScClient()
      const provider = await client.addChain("")
      const chain = mockedConnector.latestChain()
      chain._triggerCallback({
        jsonrpc: "2.0",
        id: "health-checker:0",
        result: {
          isSyncing: false,
          peers: 1,
          shouldHavePeers: true,
        },
      })
      await wait(0)

      await expect(provider.unsubscribe("", "", "")).rejects.toThrowError(
        "Unable to find active subscription=::",
      )
    })
  })
})
