import { helper } from "@polkadot-api/light-client-extension-helpers/extension-page"
import { useEffect, useState } from "react"
import { useIsMounted } from "./useIsMounted"

const wellKnownChainIdByGenesisHash: Record<string, string> = {
  "0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3":
    "polkadot",
  "0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe":
    "ksmcc3",
  "0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e":
    "westend2",
  "0x6408de7737c59c238890533af25896a2c20608d8b380bb01029acb392781063e":
    "rococo_v2_2",
}

type Chain = {
  chainName: string
  isWellKnown: boolean
  details: ChainDetails[]
}

type ChainDetails = {
  tabId?: number
  url?: string
  peers: number
  isSyncing: boolean
  chainId: string
  bestBlockHeight: number | undefined
}

export const useChains = () => {
  const [chains, setChains] = useState<Chain[]>()
  const isMounted = useIsMounted()

  useEffect(() => {
    ;(async () => {
      const connections = await helper.getActiveConnections()
      const chains = await helper.getChains()
      const tabs = await chrome.tabs.query({
        url: ["https://*/*", "http://*/*"],
      })
      const urlByTabId = Object.fromEntries(
        tabs
          .filter(({ id }) => !!id)
          .map(({ id, url }) => [id!, { id: id!, url }]),
      )
      const detailsByGenesisHash = connections.reduce(
        (acc, { genesisHash, tabId }) => {
          acc[genesisHash] ??= []
          acc[genesisHash].push({ tabId, url: urlByTabId[tabId].url })
          return acc
        },
        {} as Record<string, { tabId: number; url?: string }[]>,
      )
      if (!isMounted) return
      setChains(
        chains
          .filter(({ genesisHash }) => genesisHash in detailsByGenesisHash)
          .map(({ genesisHash, name }) => ({
            chainName: name,
            isWellKnown: !!wellKnownChainIdByGenesisHash[genesisHash],
            details: detailsByGenesisHash[genesisHash].map(
              ({ tabId, url }) => ({
                tabId,
                url,
                // FIXME: subscribe to peers
                peers: -1,
                // FIXME: compute
                isSyncing: false,
                // FIXME: How to compute chainId for non-wellKnownChains?
                chainId:
                  wellKnownChainIdByGenesisHash[genesisHash] ?? genesisHash,
                // FIXME: subscribe to bestBlockHeight
                bestBlockHeight: -1,
              }),
            ),
          })),
      )
    })()
  }, [])

  return { chains }
}
