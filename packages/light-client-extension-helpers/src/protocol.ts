import type {
  ToExtension as ConnectToExtension,
  ToApplication as ConnectToApplication,
} from "@substrate/connect-extension-protocol"

export type PostMessage<T> = {
  channelId: string
  msg: T
}

type Message<TOrigin, TRest extends { type: string }> = {
  origin: TOrigin
} & TRest

export type ToExtension = ToExtensionRequest | ConnectToExtension

export type ToExtensionRequest = Message<
  "@substrate/light-client-extension-helper-context-web-page",
  {
    id: string
  } & (BackgroundRequestGetChain | BackgroundRequestGetChains)
>

// export type ToBackground = ToBackgroundKeepAlive

// type ToBackgroundKeepAlive = Message<
//   "@substrate/light-client-extension-helper-context-content-script",
//   {
//     type: "keep-alive"
//   }
// >

export type ToPage = ToPageResponse | ToPageNotification | ConnectToApplication

// export type ToContent = ToContentKeepAlive

export type ToPageResponse = Message<
  "@substrate/light-client-extension-helper-context-content-script",
  {
    id: string
  } & (BackgroundResponseGetChain | BackgroundResponseGetChains | ErrorResponse)
>

type ToPageNotificationOnAddChains = Message<
  "@substrate/light-client-extension-helper-context-background",
  {
    type: "onAddChains"
    chains: Record<
      string,
      {
        genesisHash: string
        name: string
      }
    >
  }
>

type ToPageNotification = ToPageNotificationOnAddChains

// type ToContentKeepAlive = Message<
//   "@substrate/light-client-extension-helper-context-background",
//   {
//     type: "keep-alive-ack"
//   }
// >

export type BackgroundRequest = Message<
  "@substrate/light-client-extension-helper-context-content-script",
  BackgroundRequestGetChain | BackgroundRequestGetChains
  // | BackgroundRequestIsBackgroundScriptReady
>
// | Message<
//     "@substrate/light-client-extension-helper-context-extension-page",
//     | BackgroundRequestDeleteChain
//     | BackgroundRequestPersistChain
//     | BackgroundRequestGetActiveConnections
//     | BackgroundRequestDisconnect
//     | BackgroundRequestSetBootNodes
//   >

// FIXME: merge BackgroundRequest/BackgroundResponse/ToExtensionRequest/ToPageResponse
type BackgroundRequestGetChain = {
  type: "getChain"
  chainSpec: string
  relayChainGenesisHash?: string
}

// type BackgroundRequestDeleteChain = {
//   type: "deleteChain"
//   genesisHash: string
// }

// type BackgroundRequestPersistChain = {
//   type: "persistChain"
//   chainSpec: string
//   relayChainGenesisHash?: string
// }

type BackgroundRequestGetChains = {
  type: "getChains"
}

// type BackgroundRequestIsBackgroundScriptReady = {
//   type: "isBackgroundScriptReady"
// }

// type BackgroundRequestGetActiveConnections = {
//   type: "getActiveConnections"
// }

// type BackgroundRequestDisconnect = {
//   type: "disconnect"
//   tabId: number
//   genesisHash: string
// }

// type BackgroundRequestSetBootNodes = {
//   type: "setBootNodes"
//   genesisHash: string
//   bootNodes: string[]
// }

export type BackgroundResponse = Message<
  "@substrate/light-client-extension-helper-context-background",
  | BackgroundResponseGetChain
  // | BackgroundResponseDeleteChain
  // | BackgroundResponsePersistChain
  | BackgroundResponseGetChains
  // | BackgroundResponseGetActiveConnections
  // | BackgroundResponseDisconnect
  // | BackgroundResponseSetBootNodes
  // | BackgroundResponseIsBackgroundScriptReady
>

type BackgroundResponseGetChain = {
  type: "getChainResponse"
  chain: {
    genesisHash: string
    name: string
  }
}

// type BackgroundResponseDeleteChain = {
//   type: "deleteChainResponse"
// }

// type BackgroundResponsePersistChain = {
//   type: "persistChainResponse"
// }

type BackgroundResponseGetChains = {
  type: "getChainsResponse"
  chains: Record<string, { genesisHash: string; name: string }>
}

// type BackgroundResponseGetActiveConnections = {
//   type: "getActiveConnectionsResponse"
//   connections: {
//     tabId: number
//     chain: {
//       genesisHash: string
//       chainSpec: string
//       relayChainGenesisHash?: string
//       name: string
//       ss58Format: number
//       bootNodes: Array<string>
//     }
//   }[]
// }

// type BackgroundResponseDisconnect = {
//   type: "disconnectResponse"
// }

// type BackgroundResponseSetBootNodes = {
//   type: "setBootNodesResponse"
// }

// type BackgroundResponseIsBackgroundScriptReady = {
//   type: "isBackgroundScriptReadyResponse"
// }

export type BackgroundResponseError = Message<
  "@substrate/light-client-extension-helper-context-background",
  ErrorResponse
>

type ErrorResponse = {
  type: "error"
  error: string
}
