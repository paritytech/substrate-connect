export type NetworkStatus = "connected" | "disconnecting" | "disconnected"

export interface TabInterface {
  tabId: number | undefined
  url: string | undefined
  networks: string[]
  isActive?: boolean
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
