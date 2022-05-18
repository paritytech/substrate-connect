import React, {
  FunctionComponent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react"

import { MdOutlineSettings, MdCallMade } from "react-icons/md"
import { BiDotsHorizontalRounded } from "react-icons/bi"

import { Accordion, ConnectedTab, Logo } from "../components"
import { Background } from "../background"

const knownChains = ["polkadot", "kusama", "westend", "rococo"]

interface PoupChains {
  chainName: string
  details?: ChainDetails[]
}

interface ChainDetails {
  tabId?: number
  url?: string
  peers: number
  isSyncing: boolean
  chainId: string
}

const Popup: FunctionComponent = () => {
  const disconnectTab = useRef<(tabId: number, chainId?: string) => void>(
    (_: number, __?: string) => {},
  )
  const [connChains, setConnChains] = useState<PoupChains[] | undefined>()

  const refresh = () => {
    chrome.runtime.getBackgroundPage((backgroundPage) => {
      const bg = backgroundPage as Background
      const allChains: PoupChains[] = []

      bg.uiInterface.chains.forEach((c) => {
        const i = allChains.findIndex((i) => i.chainName === c.chainName)
        if (i === -1) {
          allChains.push({ chainName: c.chainName })
          allChains[allChains.length]?.details?.push({
            tabId: c.tab?.id,
            url: c.tab?.url,
            peers: c.peers,
            isSyncing: c.isSyncing,
            chainId: c.chainId,
          })
        } else {
          const details = allChains[i]?.details
          if (!details) {
            allChains[i].details = [
              {
                tabId: c.tab?.id,
                url: c.tab?.url,
                peers: c.peers,
                isSyncing: c.isSyncing,
                chainId: c.chainId,
              },
            ]
          } else if (!details.map((d) => d.tabId).includes(c.tab?.id)) {
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
    const icon = network.replace(new RegExp(" ", "g"), "").toLowerCase()
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

  console.log("connChains", connChains)

  return (
    <main className="w-80">
      <header className="my-3 mx-6 flex justify-between border-b border-neutral-200 pt-1.5 pb-4 leading-4">
        <Logo textSize="xl" cName={"leading-4"} />
        <MdOutlineSettings
          onClick={goToOptions}
          className="text-xl leading-5 cursor-pointer hover:color-neutral-200"
        />
      </header>
      {connChains?.map((w) => {
        if (!w?.details) {
          return (
            <div key={w.chainName} className="pl-6 py-2 flex text-lg">
              {networkIcon(w.chainName)}
            </div>
          )
        }
        const contents: ReactNode[] = w?.details.map((t) => (
          <div key={t.url} className="flex justify-between">
            <div className="ml-6 w-full truncate text-base underline text-blue-500">
              {t.url}
            </div>
            <div>
              <div data-testid="Tooltip" className="tooltip">
                <span className="p-4 text-xs shadow-lg tooltiptext tooltip_left">
                  <div onClick={() => t && t.tabId && onDisconnect(t.tabId)}>
                    Disconnect tab
                  </div>
                </span>
                <BiDotsHorizontalRounded className="ml-2 text-base" />
              </div>
            </div>
          </div>
        ))

        return (
          <Accordion
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
            showTitleIcon
          />
        )
      })}

      <div className="border-t border-neutral-200 pt-2 mt-2 mx-8">
        <button
          className="font-inter mb-3 mt-1.5 flex w-full justify-between py-1.5 text-sm font-light capitalize hover:bg-stone-200"
          onClick={() =>
            chrome.tabs.update({
              url: "https://paritytech.github.io/substrate-connect/#extension",
            })
          }
        >
          <div className="text-lg">About</div>
          <div>
            <MdCallMade className="text-xl" />
          </div>
        </button>
      </div>
    </main>
  )
}

export default Popup
