import type { Chain } from "@substrate/smoldot-light"

export type NetworkTypes = "kusama" | "polkadot" | "westend" | "rococo"

export type NetworkStatus = "connected" | "disconnecting" | "disconnected"

export interface TabInterface {
  tabId: number | undefined
  url: string | undefined
  networks: string[] // TODO: for now pass strings in order to make the v0 prototype
  isActive?: boolean
}

export interface NetworkMainInfo {
  name: string
  id: string
  icon?: string
  status: NetworkStatus
}
export interface Network extends NetworkMainInfo {
  chain: Chain
  tabId: number
  parachains?: Parachain[]
}
export interface Parachain extends NetworkMainInfo {
  relaychain: string
}

export interface NetworkTabProps {
  name: string
  health: OptionsNetworkTabHealthContent
  apps: App[]
}

export interface OptionsNetworkTabHealthContent {
  isSyncing: boolean
  peers: number
  status: NetworkStatus
}
export interface App {
  name: string
  url?: string
}

export type NetworkCtx = TabInterface[]
