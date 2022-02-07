import { getPublicApi } from "./smoldot-light"
import { jest } from "@jest/globals"
import type { AddChainOptions, ClientOptions } from "@substrate/smoldot-light"
import {
  AlreadyDestroyedError,
  CrashError,
  JsonRpcDisabledError,
} from "./errors"

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
    const addChain = (addChainOptions: AddChainOptions) => {
      let _remove = jest.fn<void, []>()
      let _sendJsonRpc = jest.fn<void, [rpc: string]>()
      return {
        _addChainOptions: addChainOptions,
        remove() {
          _remove()
        },
        _setRemove(nextRemove: typeof _remove) {
          _remove = nextRemove
        },
        _getSendRemove: () => _remove,
        sendJsonRpc(rpc: string) {
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

    return {
      _options: options,
      _getChains: () => chains,
      terminate: jest.fn(),
      addChain: (addChainOptions: AddChainOptions) => {
        const chain = addChain(addChainOptions)
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
jest.unstable_mockModule("./specs/generated/polkadot.js", () => ({
  default: "polkadotFakeChainSpec",
}))

type MockSmoldotLight = ReturnType<typeof mockSmoldotLightFactory>
let mockedSmoldotLight: MockSmoldotLight

beforeAll(async () => {
  mockedSmoldotLight = (await import(
    "@substrate/smoldot-light"
  )) as unknown as MockSmoldotLight
})

describe("SmoldotConnect::smoldot-light", () => {
  describe("client", () => {
    it("does not eagerly instantiate the client", () => {
      getPublicApi({})
      expect(mockedSmoldotLight.getLatestClient()).toBeUndefined()
    })

    it("terminates the client when all its chains have been removed", async () => {
      const { addChain } = getPublicApi({})
      const chain1 = await addChain("")
      expect(mockedSmoldotLight.getLatestClient()).not.toBeUndefined()
      const client = mockedSmoldotLight.getLatestClient()

      const chain2 = await addChain("")

      chain1.remove()
      expect(client.terminate).not.toHaveBeenCalled()

      chain2.remove()
      expect(client.terminate).toHaveBeenCalled()
      expect(mockedSmoldotLight.getLatestClient()).toBe(client)

      const chain3 = await addChain("")
      expect(mockedSmoldotLight.getLatestClient()).not.toBe(client)
      expect(
        mockedSmoldotLight.getLatestClient().terminate,
      ).not.toHaveBeenCalled()
      chain3.remove()
    })
  })

  describe("chain", () => {
    it("sends/receives rpc messages", async () => {
      const { addChain } = getPublicApi({})
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
      const { addChain, addWellKnownChain } = getPublicApi({})
      const chainSpec = "testChainSpec"
      await addChain(chainSpec)

      let mockedChain = mockedSmoldotLight.getLatestClient()._getChains()[0]
      expect(mockedChain._addChainOptions.chainSpec).toEqual(chainSpec)

      await addWellKnownChain("polkadot")

      mockedChain = mockedSmoldotLight.getLatestClient()._getChains()[1]
      expect(mockedChain._addChainOptions.chainSpec).toEqual(
        "polkadotFakeChainSpec",
      )
    })

    it("propagates the correct potentialRelayChains to smoldot-light", async () => {
      const { addChain } = getPublicApi({})
      const prevChains = await Promise.all(
        Array(3)
          .fill(null)
          .map(() => addChain("")),
      )

      prevChains[0].remove()
      await addChain("", undefined, prevChains)

      const mockedChains = mockedSmoldotLight.getLatestClient()._getChains()
      const lastMockedChain = mockedChains[3]

      expect(lastMockedChain._addChainOptions.potentialRelayChains).toEqual([
        mockedChains[1],
        mockedChains[2],
      ])
    })

    it("propagates the correct CrashError", async () => {
      const { addChain } = getPublicApi({})
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
          throw "foo"
        }),
      )
      expect(() => chain.sendJsonRpc("")).toThrow(
        new CrashError("Unexpected error foo"),
      )
    })

    it("propagates the correct AlreadyDestroyedError", async () => {
      const { addChain } = getPublicApi({})
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
      const { addChain } = getPublicApi({})
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

      mockedChain._setSendJsonRpc(
        jest.fn((_) => {
          throw new SdJsonRpcDisabledError()
        }),
      )

      expect(() => chain.sendJsonRpc("")).toThrow(JsonRpcDisabledError)
    })
  })
})
