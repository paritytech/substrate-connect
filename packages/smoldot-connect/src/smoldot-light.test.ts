import { getPublicApi } from "./smoldot-light"
import { jest } from "@jest/globals"
import type { AddChainOptions, ClientOptions } from "@substrate/smoldot-light"

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
        return chain
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
type MockSmoldotLight = ReturnType<typeof mockSmoldotLightFactory>

jest.unstable_mockModule("@substrate/smoldot-light", mockSmoldotLightFactory)

describe("SmoldotConnect::Extension", () => {})
