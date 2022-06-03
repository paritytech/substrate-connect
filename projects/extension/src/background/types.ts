export interface ExposedChainConnection {
  chainId: string
  chainName: string
  tab?: ExposedChainConnectionTabInfo
  isSyncing: boolean
  peers: number
  latestBestBlock?: number
}

export interface ExposedChainConnectionTabInfo {
  id: number
  url: string
}
