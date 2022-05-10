import React, {
  FunctionComponent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react"

import { MdOutlineSettings, MdCallMade } from "react-icons/md"

import { Accordion, ConnectedTab, Logo } from "../components"
import { Background } from "../background"
import { TabInterface } from "../types"

const Popup: FunctionComponent = () => {
  const disconnectTabRef = useRef<(tapId: number) => void>((_: number) => {})
  const [tabs, setTabs] = useState<TabInterface[]>([])
  const [knownChains, setKnownChains] = useState<string[]>([])
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
        setKnownChains(bg.uiInterface.integratedChains)
        const totalChains = bg.uiInterface.integratedChains
        bg.uiInterface.chains.forEach((c) => {
          if (!totalChains.includes(c.chainName)) {
            totalChains.push(c.chainName)
          }
        })

        setConnChains(totalChains)

        disconnectTabRef.current = bg.uiInterface.disconnectTab

        const refresh = () => {
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

  const networkIcon = (icon: string) => {
    return (
      <div className="pl-2 flex text-xl">
        <div className="icon w-7">{icon.toLowerCase()}</div>
        <div className="pl-2">{icon}</div>
      </div>
    )
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
              <div>
                {t.url} - {t.tabId}
              </div>,
            )
          }
        })

        return (
          <Accordion
            titleClass="popup-accordion-title"
            contentClass="popup-accordion-content"
            titles={[networkIcon(w)]}
            contents={[<div>{contents}</div>]}
          />
        )
      })}

      {/* This is the "old" way */}
      {/* tabs.length > 0 && (
        <div className="my-1">
          {tabs.map((t) => (
            <ConnectedTab
              disconnectTab={disconnectTabRef.current}
              key={t.tabId}
              tab={t}
            />
          ))}
        </div>
      ) */}
      <button
        className="font-inter my-3 mx-4 flex w-11/12 justify-between px-2 py-1.5 text-sm font-light capitalize hover:bg-stone-200  border-t border-neutral-200 pt-4"
        onClick={() =>
          chrome.tabs.update({
            url: "https://paritytech.github.io/substrate-connect/#extension",
          })
        }
      >
        <div className="text-xl">About</div>
        <div>
          <MdCallMade className="text-2xl" />
        </div>
      </button>
    </main>
  )
}

export default Popup
