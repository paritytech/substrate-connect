// eslint-disable-next-line import/no-extraneous-dependencies
import { beforeEach, beforeAll, it, describe, expect, vi } from "vitest"
import type { AddChainOptions, ClientOptions } from "smoldot"
import { WellKnownChain } from "../WellKnownChain"
import { ScClient } from "./types"

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

class SdMalformedJsonRpcError extends Error {
  constructor() {
    super()
    this.name = "MalformedJsonRpcError"
  }
}

class SdQueueFullError extends Error {
  constructor() {
    super()
    this.name = "QueueFullError"
  }
}

var mockSmoldotLightFactory = () => {
  const start = (options: ClientOptions) => {
    const addChain = (
      addChainOptions: AddChainOptions,
      isClientTerminated: () => boolean,
    ) => {
      let _remove = vi.fn()
      let _sendJsonRpc = vi.fn()
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

    const terminate = vi.fn()

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
  var mock = {
    AlreadyDestroyedError: SdAlreadyDestroyedError,
    CrashError: SdCrashError,
    JsonRpcDisabledError: SdJsonRpcDisabledError,
    MalformedJsonRpcError: SdMalformedJsonRpcError,
    QueueFullError: SdQueueFullError,
    start: (options: ClientOptions) => {
      return (latestClient = start(options))
    },
    getLatestClient: () => latestClient,
  }
  return mock
}

vi.doMock("smoldot", mockSmoldotLightFactory)
vi.doMock("./specs/index.js", () => ({
  getSpec: (wellKnownChain: string) => `fake-${wellKnownChain}-spec`,
}))

type MockSmoldotLight = ReturnType<typeof mockSmoldotLightFactory>
let mockedSmoldotLight: MockSmoldotLight

let createScClient: () => ScClient
beforeAll(async () => {
  // ;({ createScClient } = await import("./smoldot-light"))
  mockedSmoldotLight = mockSmoldotLightFactory as unknown as MockSmoldotLight
})

beforeEach(() => {
  vi.resetModules()
})

describe("SmoldotConnect::smoldot", () => {
  describe("client", () => {
    it("does not eagerly instantiate the client", () => {
      import("./smoldot-light").then((smoldot) => {
        smoldot.createScClient()
        mockedSmoldotLight =
          mockSmoldotLightFactory as unknown as MockSmoldotLight

        expect(mockedSmoldotLight.start).toBeUndefined()
      })
    })

    it("terminates the internal client when all the chains, from all clients, have been removed", () => {
      import("./smoldot-light").then((smoldot) => {
        const { addWellKnownChain, addChain } = smoldot.createScClient()

        addWellKnownChain("" as WellKnownChain).then((chain1) => {
          const client = mockedSmoldotLight?.getLatestClient()
          addChain("").then((chain2) => {
            expect(client).toBe(mockedSmoldotLight.getLatestClient())

            chain1.remove()
            expect(client.terminate).not.toHaveBeenCalled()

            chain2.remove()
            expect(client.terminate).toHaveBeenCalled()
          })
          addWellKnownChain("" as WellKnownChain).then((chain3) => {
            expect(mockedSmoldotLight.getLatestClient()).not.toBe(client)
            expect(
              mockedSmoldotLight.getLatestClient().terminate,
            ).not.toHaveBeenCalled()
            chain3.remove()
            expect(
              mockedSmoldotLight.getLatestClient().terminate,
            ).toHaveBeenCalled()
          })
        })
      })
    })

    it("handles race conditions on the client when adding/removing chains", () => {
      import("./smoldot-light").then((smoldot) => {
        const { addChain } = smoldot.createScClient()
        const { addChain: addChain2 } = smoldot.createScClient()

        addChain("").then((chain1) => {
          const client = mockedSmoldotLight.getLatestClient()
          const chain2Promise = addChain2("")
          chain1.remove()
          expect(client.terminate).not.toHaveBeenCalled()

          chain2Promise.then((chain2) => {
            chain2.remove()
            expect(client.terminate).toHaveBeenCalled()
          })
        })
      })
    })
  })

  describe("chain", () => {
    it("propagates the correct chainSpec to smoldot", async () => {
      import("./smoldot-light").then((smoldot) => {
        const { addChain, addWellKnownChain } = smoldot.createScClient()
        const chainSpec = "testChainSpec"
        addChain(chainSpec).then(() => {
          let mockedChain = mockedSmoldotLight
            .getLatestClient()
            ._getLatestChain()
          expect(mockedChain._addChainOptions.chainSpec).toEqual(chainSpec)

          addWellKnownChain(WellKnownChain.polkadot).then(() => {
            mockedChain = mockedSmoldotLight.getLatestClient()._getLatestChain()
            expect(mockedChain._addChainOptions.chainSpec).toEqual(
              "fake-polkadot-spec",
            )
          })

          addWellKnownChain(WellKnownChain.ksmcc3).then(() => {
            mockedChain = mockedSmoldotLight.getLatestClient()._getLatestChain()
            expect(mockedChain._addChainOptions.chainSpec).toEqual(
              "fake-ksmcc3-spec",
            )
          })

          addWellKnownChain(WellKnownChain.rococo_v2_2).then(() => {
            mockedChain = mockedSmoldotLight.getLatestClient()._getLatestChain()
            expect(mockedChain._addChainOptions.chainSpec).toEqual(
              "fake-rococo_v2_2-spec",
            )
          })
        })
      })
    })

    it("propagates the correct potentialRelayChainIds to smoldot", async () => {
      import("./smoldot-light").then((smoldot) => {
        const { addChain } = smoldot.createScClient()
        Promise.all(
          Array(3)
            .fill(null)
            .map(() => addChain("")),
        ).then((prevChains) => {
          prevChains[0].remove()
          addChain("").then(() => {
            const mockedChains = mockedSmoldotLight
              .getLatestClient()
              ._getChains()
              .slice(-4)
            const lastMockedChain = mockedChains[3]
            expect(
              lastMockedChain._addChainOptions.potentialRelayChains,
            ).toEqual([mockedChains[1], mockedChains[2]])
          })
        })
      })
    })
  })
})
