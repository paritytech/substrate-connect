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
import { TabInterface } from "../types"

const knownChains = ["polkadot", "kusama", "westend", "rococo"]

const Popup: FunctionComponent = () => {
  const disconnectTabRef = useRef<(tapId: number) => void>((_: number) => {})
  const [tabs, setTabs] = useState<TabInterface[]>([])
  const [connChains, setConnChains] = useState<string[]>([])

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

        disconnectTabRef.current = bg.uiInterface.disconnectTab

        const refresh = () => {
          const totalChains = bg.uiInterface.integratedChains
          bg.uiInterface.chains.forEach((c) => {
            if (!totalChains.includes(c.chainName)) {
              totalChains.push(c.chainName)
            }
          })

          setConnChains(totalChains)
          const networksByTab: Map<number, Set<string>> = new Map()
          bg.uiInterface.chains.forEach((app) => {
            if (!app.tab) return
            if (!networksByTab.has(app.tab.id))
              networksByTab.set(app.tab.id, new Set())
            networksByTab.get(app.tab.id)!.add(app.chainName)
          })

          const nextTabs: TabInterface[] = []
          browserTabs.forEach((tab) => {
            if (!networksByTab.has(tab.id!)) return
            const result = {
              tabId: tab.id!,
              url: tab.url,
              networks: [...networksByTab.get(tab.id!)!],
            }
            nextTabs.push(result)
          })

          setTabs(nextTabs)
        }
        unsubscribe = bg.uiInterface.onChainsChanged(refresh)
        refresh()
      })
    })()

    return () => {
      isActive = false
      unsubscribe()
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
    if (tabId) {
      disconnectTabRef.current(tabId)
      setTabs(
        tabs.filter((t) => {
          if (t.tabId !== tabId) return t
        }),
      )
    }
  }

  return (
    <main className="w-80">
      <header className="my-3 mx-6 flex justify-between border-b border-neutral-200 pt-1.5 pb-4 leading-4">
        <Logo textSize="xl" cName={"leading-4"} />
        <MdOutlineSettings
          onClick={goToOptions}
          className="text-xl leading-5 cursor-pointer hover:color-neutral-200"
        />
      </header>
      {connChains.map((w) => {
        const contents: ReactNode[] = []
        tabs.filter((t) => {
          if (t.networks.includes(w)) {
            contents.push(
              <div className="flex justify-between">
                <div className="ml-6 w-full truncate text-base underline text-blue-500">
                  {t.url}
                </div>
                <div>
                  <div data-testid="Tooltip" className="tooltip">
                    <span className="p-4 text-xs shadow-lg tooltiptext tooltip_left">
                      <div
                        onClick={() => t && t.tabId && onDisconnect(t.tabId)}
                      >
                        Disconnect app
                      </div>
                      {/* <div onClick={() => console.log("ban")}>Ban app</div> */}
                    </span>
                    <BiDotsHorizontalRounded className="ml-2 text-base text-red-500" />
                  </div>
                </div>
              </div>,
            )
          }
        })

        if (contents.length) {
          return (
            <Accordion
              titleClass="popup-accordion-title"
              contentClass="popup-accordion-content"
              titles={[
                <div className="flex justify-between items-center w-full">
                  <div className="pl-4 flex text-lg justify-start">
                    {networkIcon(w)}
                  </div>
                </div>,
              ]}
              contents={[<>{contents}</>]}
              showTitleIcon
            />
          )
        } else {
          return <div className="pl-6 py-2 flex text-lg">{networkIcon(w)}</div>
        }
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
