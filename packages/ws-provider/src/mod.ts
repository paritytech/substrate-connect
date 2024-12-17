/* eslint-disable import/no-extraneous-dependencies */
import {
  getInternalWsProvider,
  type StatusChange,
  type WsJsonRpcProvider,
} from "@polkadot-api/ws-provider/web"

export namespace GetWsProvider {
  export type Options = {
    endpoints: Array<
      | string
      | {
          uri: string
          protocol: string[]
        }
    >
    onStatusChanged?: (status: StatusChange) => void
    timeout?: number
    websocketConstructor?: typeof globalThis.WebSocket
  }

  export type GetWsProvider = (options: Options) => WsJsonRpcProvider
}

export const getWsProvider: GetWsProvider.GetWsProvider = (options) => {
  const wsProvider = getInternalWsProvider(
    options.websocketConstructor ?? globalThis.WebSocket,
  )

  return wsProvider(options)
}

export {
  WsEvent,
  type WsConnecting,
  type WsConnected,
  type WsError,
  type WsClose,
  type StatusChange,
  type JsonRpcProvider,
  type WsJsonRpcProvider,
} from "@polkadot-api/ws-provider/web"
