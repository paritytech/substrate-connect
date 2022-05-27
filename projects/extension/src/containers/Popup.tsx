import React, {
  FunctionComponent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react"

import { MdOutlineSettings, MdCallMade, MdLinkOff } from "react-icons/md"

import { Accordion, Logo } from "../components"
import { Background } from "../background"

const knownChains = ["polkadot", "kusama", "westend", "rococo"]

interface PopupChain {
  chainName: string
  details: ChainDetails[]
}

interface ChainDetails {
  tabId?: number
  url?: string
  peers: number
  isSyncing: boolean
  chainId: string
}

const Popup: FunctionComponent = () => {
  const disconnectTab = useRef<(tabId: number) => void>((_: number) => {})
  const [connChains, setConnChains] = useState<PopupChain[] | undefined>()

  const refresh = () => {
    chrome.runtime.getBackgroundPage((backgroundPage) => {
      const bg = backgroundPage as Background
      const allChains: PopupChain[] = []

      bg.uiInterface.chains.forEach((c) => {
        const i = allChains.findIndex((i) => i.chainName === c.chainName)
        if (i === -1) {
          allChains.push({
            chainName: c.chainName,
            details: [
              {
                tabId: c.tab?.id,
                url: c.tab?.url,
                peers: c.peers,
                isSyncing: c.isSyncing,
                chainId: c.chainId,
              },
            ],
          })
        } else {
          const details = allChains[i]?.details
          if (!details.map((d) => d.tabId).includes(c.tab?.id)) {
            details.push({
              tabId: c.tab?.id,
              url: c.tab?.url,
              peers: c.peers,
              isSyncing: c.isSyncing,
              chainId: c.chainId,
            })
          }
        }
      })
      setConnChains([...allChains])
    })
  }

  useEffect(() => {
    let isActive = true
    let unsubscribe = () => {}

    ;(async () => {
      // retrieve open tabs and assign to local state
      const browserTabs = await new Promise<chrome.tabs.Tab[]>((res) =>
        chrome.tabs.query({ currentWindow: true }, res),
      )
      if (!isActive) return

      chrome.runtime.getBackgroundPage((backgroundPage) => {
        if (!isActive) return
        const bg = backgroundPage as Background
        disconnectTab.current = bg.uiInterface.disconnectTab
        unsubscribe = bg.uiInterface.onChainsChanged(refresh)
        refresh()
      })
    })()

    return () => {
      isActive = false
      unsubscribe && unsubscribe()
    }
  }, [])

  const goToOptions = (): void => {
    chrome.runtime.openOptionsPage()
  }

  const networkIcon = (network: string) => {
    const icon = network.toLowerCase()
    return (
      <>
        <div className="icon w-7">
          {knownChains.includes(icon) ? icon : "?"}
        </div>
        <div className="pl-2">{network}</div>
      </>
    )
  }

  const onDisconnect = (tabId: number): void => {
    disconnectTab.current(tabId)
    refresh()
  }

  return (
    <main className="w-80">
      <header className="my-3 mx-6 flex justify-between border-b border-neutral-200 pt-1.5 pb-4 leading-4">
        <Logo textSize="xl" cName={"leading-4"} />
        <div className="tooltip">
          <span className="p-4 text-xs shadow-lg tooltipDark tooltip_left">
            Go to Options
          </span>
          <MdOutlineSettings
            onClick={goToOptions}
            className="text-xl leading-5 cursor-pointer hover:color-neutral-200"
          />
        </div>
      </header>
      <div className="pb-3.5">
        {connChains?.map((w) => {
          if (w?.details?.length === 1 && !w?.details[0].tabId)
            return (
              <div key={w.chainName} className="pl-6 py-2 flex text-lg">
                {networkIcon(w.chainName)}
              </div>
            )
          const contents: ReactNode[] = []
          w?.details?.forEach((t) => {
            if (t.tabId) {
              contents.push(
                <div key={t.url} className="flex justify-between">
                  <div className="ml-6 w-full truncate text-base">{t.url}</div>

                  <div
                    className="tooltip"
                    onClick={() => t && t.tabId && onDisconnect(t.tabId)}
                  >
                    <span className="p-4 text-xs shadow-lg tooltipDark tooltip_left">
                      Disconnect tab
                    </span>
                    <MdLinkOff className="ml-2 text-base" />
                  </div>
                </div>,
              )
            }
          })

          return (
            <Accordion
              defaultAllExpanded={true}
              titleClass="popup-accordion-title"
              contentClass="popup-accordion-content"
              titles={[
                <div className="flex justify-between items-center w-full">
                  <div className="pl-4 flex text-lg justify-start">
                    {networkIcon(w.chainName)}
                  </div>
                </div>,
              ]}
              contents={[<>{contents}</>]}
              showTitleIcon={!!contents.length}
            />
          )
        })}
      </div>
      <div className="border-t border-neutral-200 mx-8" />
      <div className="pl-8 pr-6 hover:bg-stone-200">
        <button
          className="font-inter flex w-full justify-between py-3.5 text-sm font-light capitalize"
          onClick={() =>
            window.open(
              "https://paritytech.github.io/substrate-connect/#extension",
            )
          }
        >
          <div className="text-lg">About</div>
          <div className="tooltip">
            <span className="p-4 text-xs shadow-lg tooltipDark tooltip_left">
              Go to Landing Page
            </span>
            <MdCallMade className="text-xl" />
          </div>
        </button>
      </div>
    </main>
  )
}

export default Popup
