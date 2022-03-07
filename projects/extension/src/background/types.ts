export interface ExposedChainConnection {
  chainId: string
  chainName: string
  tabId: number
  url: string
  isSyncing: boolean
  peers: number
}
