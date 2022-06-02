export interface ExposedChainConnection {
  chainId: string
  chainName: string
  tab?: ExposedChainConnectionTabInfo
  isSyncing: boolean
  peers: number
  lastBlock?: number
}

export interface ExposedChainConnectionTabInfo {
  id: number
  url: string
}
