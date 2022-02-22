import { SmoldotHealth } from "@substrate/connect"

export interface ExposedChainConnection {
  chainId: string
  chainName: string
  tabId: number
  url: string
  healthStatus?: SmoldotHealth
}
