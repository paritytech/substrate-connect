export type NetworkStatus = "connected" | "disconnecting" | "disconnected"

export interface TabInterface {
  tabId: number | undefined
  url: string | undefined
  networks: string[]
  isActive?: boolean
}

export interface NetworkTabProps {
  name: string
  isWellKnown: boolean
  health: OptionsNetworkTabHealthContent
  apps: App[]
}

export interface OptionsNetworkTabHealthContent {
  isSyncing: boolean
  peers: number
  status: NetworkStatus
  bestBlockHeight?: number
}
export interface App {
  name: string
  url?: string
}
