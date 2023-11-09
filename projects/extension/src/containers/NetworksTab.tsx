import { ReactNode, useEffect, useState } from "react"

import { Accordion, IconWeb3 } from "../components"
import * as environment from "../environment"

interface ChainDetails {
  tabId?: number
  url?: string
  peers: number
  isSyncing: boolean
  chainId: string
  bestBlockHeight: number | undefined
}

interface PopupChain {
  chainName: string
  isWellKnown: boolean
  details: ChainDetails[]
}

export const NetworksTab = () => {
  const [connChains, setConnChains] = useState<PopupChain[] | undefined>()

  const refresh = () => {
    environment.getAllActiveChains().then((chains) => {
      const allChains: PopupChain[] = []
      ;(chains || []).forEach((c) => {
        const i = allChains.findIndex(
          (i) => i.chainName === c.chainName && i.isWellKnown === c.isWellKnown,
        )
        const { peers, isSyncing, chainId, bestBlockHeight } = c
        if (i === -1) {
          allChains.push({
            chainName: c.chainName,
            isWellKnown: c.isWellKnown,
            details: [
              {
                tabId: c.tab.id,
                url: c.tab.url,
                peers,
                isSyncing,
                chainId,
                bestBlockHeight,
              },
            ],
          })
        } else {
          const details = allChains[i]?.details
          if (!details.map((d) => d.tabId).includes(c.tab.id)) {
            details.push({
              tabId: c.tab.id,
              url: c.tab.url,
              peers,
              isSyncing,
              chainId,
              bestBlockHeight,
            })
          }
        }
      })
      setConnChains([...allChains])
    })
  }

  const networkIcon = (network: string, isWellKnown: boolean) => {
    const icon = network.toLowerCase()
    return (
      <>
        <IconWeb3 isWellKnown={isWellKnown}>{icon}</IconWeb3>
        <div className="pl-2">{network}</div>
      </>
    )
  }

  useEffect(() => {
    const unregister = environment.onActiveChainsChanged(() => refresh())
    refresh()
    return unregister
  }, [])

  return (
    <div className={!connChains?.length ? "" : "pb-3.5"}>
      {!connChains?.length ? (
        <div className="mx-8 my-8">
          The extension isn't connected to any network.
        </div>
      ) : (
        connChains?.map((w) => {
          if (w?.details?.length === 1 && !w?.details[0].tabId)
            return (
              <>
                <div className="block mt-4">
                  <div key={w.chainName} className="pl-6 flex text-lg">
                    {networkIcon(w.chainName, w.isWellKnown)}
                  </div>
                  <div className="pl-[4.5rem] text-sm flex pt-2">
                    <span className="text-[#323232]">Latest block</span>
                    <span className="pl-2 text-[#24CC85]">
                      {w?.details[0].bestBlockHeight?.toLocaleString("en-US") ||
                        "Syncing..."}
                    </span>
                  </div>
                </div>
                <div className="pl-[4.5rem] flex pt-2 pb-4 text-[#616161]">
                  No network
                </div>
              </>
            )
          const contents: ReactNode[] = []
          w?.details?.forEach((t) => {
            if (t.tabId) {
              contents.push(
                <div key={t.url} className="flex justify-between">
                  <div className="ml-8 text-sm w-full truncate text-base">
                    {t.url}
                  </div>
                </div>,
              )
            }
          })

          return (
            <Accordion
              defaultAllExpanded={true}
              titleclassName="popup-accordion-title"
              contentclassName="popup-accordion-content"
              titles={[
                <div className="block mt-4">
                  <div className="pl-4 flex text-lg justify-start">
                    {networkIcon(w.chainName, w.isWellKnown)}
                    <span className="pl-2 text-[#616161]">
                      ({contents.length})
                    </span>
                  </div>
                  <div className="pl-16 flex pt-2">
                    <span className="text-[#323232]">Latest block</span>
                    <span className="pl-2 text-[#24CC85]">
                      {w?.details[0].bestBlockHeight?.toLocaleString("en-US") ||
                        "Syncing..."}
                    </span>
                  </div>
                </div>,
              ]}
              contents={[<>{contents}</>]}
              showTitleIcon={!!contents.length}
            />
          )
        })
      )}
    </div>
  )
}
