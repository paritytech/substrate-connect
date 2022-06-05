export interface ExposedChainConnection {
  chainId: string
  chainName: string
  tab?: ExposedChainConnectionTabInfo
  isSyncing: boolean
  peers: number
  bestBlockHeight?: number
}

export interface ExposedChainConnectionTabInfo {
  id: number
  url: string
}
