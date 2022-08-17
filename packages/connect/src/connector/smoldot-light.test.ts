// eslint-disable-next-line import/no-extraneous-dependencies
import { jest } from "@jest/globals"
import type { AddChainOptions, ClientOptions } from "@substrate/smoldot-light"
import { WellKnownChain } from "../WellKnownChain"
import {
  AlreadyDestroyedError,
  CrashError,
  JsonRpcDisabledError,
  ScClient,
} from "./types"

class SdAlreadyDestroyedError extends Error {
  constructor() {
    super()
    this.name = "AlreadyDestroyedError"
  }
}

class SdCrashError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "CrashError"
  }
}

class SdJsonRpcDisabledError extends Error {
  constructor() {
    super()
    this.name = "JsonRpcDisabledError"
  }
}

const mockSmoldotLightFactory = () => {
  const start = (options: ClientOptions) => {
    const addChain = (
      addChainOptions: AddChainOptions,
      isClientTerminated: () => boolean,
    ) => {
      let _remove = jest.fn<() => []>()
      let _sendJsonRpc = jest.fn<(rpc: string) => void>()
      return {
        _addChainOptions: addChainOptions,
        remove() {
          if (isClientTerminated()) throw new SdAlreadyDestroyedError()
          _remove()
        },
        _setRemove(nextRemove: typeof _remove) {
          _remove = nextRemove
        },
        _getSendRemove: () => _remove,
        sendJsonRpc(rpc: string) {
          if (isClientTerminated()) throw new SdAlreadyDestroyedError()
          _sendJsonRpc(rpc)
        },
        _setSendJsonRpc(nextSendJsonRpc: typeof _sendJsonRpc) {
          _sendJsonRpc = nextSendJsonRpc
        },
        _getSendJsonRpc: () => _sendJsonRpc,
      }
    }
    type MockChain = ReturnType<typeof addChain>
    const chains: MockChain[] = []

    const terminate = jest.fn()

    return {
      _options: options,
      _getChains: () => chains,
      _getLatestChain: () => chains?.[chains.length - 1],
      terminate,
      addChain: (addChainOptions: AddChainOptions) => {
        const chain = addChain(
          addChainOptions,
          () => terminate.mock.calls.length > 0,
        )
        chains.push(chain)
        return Promise.resolve(chain)
      },
    }
  }
  type MockClient = ReturnType<typeof start>

  let latestClient: MockClient
  const mock = {
    AlreadyDestroyedError: SdAlreadyDestroyedError,
    CrashError: SdCrashError,
    JsonRpcDisabledError: SdJsonRpcDisabledError,
    start: (options: ClientOptions) => {
      return (latestClient = start(options))
    },
    getLatestClient: () => latestClient,
  }
  return mock
}

jest.unstable_mockModule("@substrate/smoldot-light", mockSmoldotLightFactory)
jest.unstable_mockModule("./specs/index.js", () => ({
  getSpec: (wellKnownChain: string) => `fake-${wellKnownChain}-spec`,
}))

type MockSmoldotLight = ReturnType<typeof mockSmoldotLightFactory>
let mockedSmoldotLight: MockSmoldotLight

let createScClient: () => ScClient
beforeAll(async () => {
  ;({ createScClient } = await import("./smoldot-light"))
  mockedSmoldotLight = (await import(
    "@substrate/smoldot-light"
  )) as unknown as MockSmoldotLight
})

describe("SmoldotConnect::smoldot-light", () => {
  describe("client", () => {
    it("does not eagerly instantiate the client", () => {
      createScClient()
      expect(mockedSmoldotLight.getLatestClient()).toBeUndefined()
    })

    it("terminates the internal client when all the chains, from all clients, have been removed", async () => {
      const { addWellKnownChain } = createScClient()
      const { addChain } = createScClient()

      const chain1 = await addWellKnownChain("" as WellKnownChain)
      const client = mockedSmoldotLight.getLatestClient()

      const chain2 = await addChain("")
      expect(client).toBe(mockedSmoldotLight.getLatestClient())

      chain1.remove()
      expect(client.terminate).not.toHaveBeenCalled()

      chain2.remove()
      expect(client.terminate).toHaveBeenCalled()

      const chain3 = await addWellKnownChain("" as WellKnownChain)
      expect(mockedSmoldotLight.getLatestClient()).not.toBe(client)
      expect(
        mockedSmoldotLight.getLatestClient().terminate,
      ).not.toHaveBeenCalled()
      chain3.remove()
      expect(mockedSmoldotLight.getLatestClient().terminate).toHaveBeenCalled()
    })

    it("handles race conditions on the client when adding/removing chains", async () => {
      const { addChain } = createScClient()
      const { addChain: addChain2 } = createScClient()

      const chain1 = await addChain("")
      const client = mockedSmoldotLight.getLatestClient()

      const chain2Promise = addChain2("")

      chain1.remove()

      expect(client.terminate).not.toHaveBeenCalled()

      const chain2 = await chain2Promise
      chain2.remove()

      expect(client.terminate).toHaveBeenCalled()
    })
  })

  describe("chain", () => {
    it("sends/receives rpc messages", async () => {
      const { addChain } = createScClient()
      const messagesReceived: string[] = []
      const chain = await addChain("", (response) => {
        messagesReceived.push(response)
      })

      const mockedChain = mockedSmoldotLight.getLatestClient()._getChains()[0]
      mockedChain._setSendJsonRpc(
        jest.fn((rpc) => {
          mockedChain._addChainOptions.jsonRpcCallback!(rpc + " pong")
        }),
      )

      chain.sendJsonRpc("ping")
      expect(messagesReceived).toEqual(["ping pong"])
    })

    it("propagates the correct chainSpec to smoldot-light", async () => {
      const { addChain, addWellKnownChain } = createScClient()
      const chainSpec = "testChainSpec"
      await addChain(chainSpec)

      let mockedChain = mockedSmoldotLight.getLatestClient()._getLatestChain()
      expect(mockedChain._addChainOptions.chainSpec).toEqual(chainSpec)

      await addWellKnownChain(WellKnownChain.polkadot)

      mockedChain = mockedSmoldotLight.getLatestClient()._getLatestChain()
      expect(mockedChain._addChainOptions.chainSpec).toEqual(
        "fake-polkadot-spec",
      )

      await addWellKnownChain(WellKnownChain.ksmcc3)

      mockedChain = mockedSmoldotLight.getLatestClient()._getLatestChain()
      expect(mockedChain._addChainOptions.chainSpec).toEqual("fake-ksmcc3-spec")

      await addWellKnownChain(WellKnownChain.rococo_v2_2)

      mockedChain = mockedSmoldotLight.getLatestClient()._getLatestChain()
      expect(mockedChain._addChainOptions.chainSpec).toEqual(
        "fake-rococo_v2_2-spec",
      )
    })

    it("propagates the correct potentialRelayChainIds to smoldot-light", async () => {
      const { addChain } = createScClient()
      const prevChains = await Promise.all(
        Array(3)
          .fill(null)
          .map(() => addChain("")),
      )

      prevChains[0].remove()
      await addChain("")

      const mockedChains = mockedSmoldotLight
        .getLatestClient()
        ._getChains()
        .slice(-4)
      const lastMockedChain = mockedChains[3]

      expect(lastMockedChain._addChainOptions.potentialRelayChains).toEqual([
        mockedChains[1],
        mockedChains[2],
      ])
    })

    it("propagates the correct CrashError", async () => {
      const { addChain } = createScClient()
      const messagesReceived: string[] = []
      const chain = await addChain("", (response) => {
        messagesReceived.push(response)
      })

      const mockedChain = mockedSmoldotLight.getLatestClient()._getLatestChain()
      mockedChain._setSendJsonRpc(
        jest.fn((rpc) => {
          mockedChain._addChainOptions.jsonRpcCallback!(rpc + " pong")
        }),
      )

      mockedChain._setSendJsonRpc(
        jest.fn((_) => {
          throw new SdCrashError("Boom sendJsonRpc!")
        }),
      )

      mockedChain._setRemove(
        jest.fn(() => {
          throw new SdCrashError("Boom remove!")
        }),
      )

      expect(() => chain.sendJsonRpc("")).toThrow(
        new CrashError("Boom sendJsonRpc!"),
      )
      expect(() => chain.remove()).toThrow(new CrashError("Boom remove!"))

      mockedChain._setSendJsonRpc(
        jest.fn((_) => {
          throw new Error("foo")
        }),
      )

      expect(() => chain.sendJsonRpc("")).toThrow(new CrashError("foo"))

      mockedChain._setSendJsonRpc(
        jest.fn((_) => {
          // eslint-disable-next-line no-throw-literal
          throw "foo"
        }),
      )
      expect(() => chain.sendJsonRpc("")).toThrow(
        new CrashError("Unexpected error foo"),
      )
    })

    it("propagates the correct AlreadyDestroyedError", async () => {
      const { addChain } = createScClient()
      const messagesReceived: string[] = []
      const chain = await addChain("", (response) => {
        messagesReceived.push(response)
      })

      const mockedChain = mockedSmoldotLight.getLatestClient()._getLatestChain()
      mockedChain._setSendJsonRpc(
        jest.fn((rpc) => {
          mockedChain._addChainOptions.jsonRpcCallback!(rpc + " pong")
        }),
      )

      mockedChain._setSendJsonRpc(
        jest.fn((_) => {
          throw new SdAlreadyDestroyedError()
        }),
      )

      mockedChain._setRemove(
        jest.fn(() => {
          throw new SdAlreadyDestroyedError()
        }),
      )

      expect(() => chain.sendJsonRpc("")).toThrow(AlreadyDestroyedError)
      expect(() => chain.remove()).toThrow(AlreadyDestroyedError)
    })

    it("propagates the correct JsonRpcDisabledError", async () => {
      const { addChain } = createScClient()
      const messagesReceived: string[] = []
      const chain = await addChain("", (response) => {
        messagesReceived.push(response)
      })

      const mockedChain = mockedSmoldotLight.getLatestClient()._getLatestChain()
      mockedChain._setSendJsonRpc(
        jest.fn((rpc) => {
          mockedChain._addChainOptions.jsonRpcCallback!(rpc + " pong")
        }),
      )

      mockedChain._setSendJsonRpc(
        jest.fn((_) => {
          throw new SdJsonRpcDisabledError()
        }),
      )

      expect(() => chain.sendJsonRpc("")).toThrow(JsonRpcDisabledError)
    })
  })
})
