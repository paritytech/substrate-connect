import React, { FunctionComponent, useEffect, useRef, useState } from "react"

import { MdOutlineSettings, MdCallMade } from "react-icons/md"

import { Logo, ConnectedTab } from "../components"
import { Background } from "../background"
import { TabInterface } from "../types"

const Popup: FunctionComponent = () => {
  const disconnectTabRef = useRef<(tapId: number) => void>((_: number) => {})
  const [activeTab, setActiveTab] = useState<TabInterface | undefined>()
  const [otherTabs, setOtherTabs] = useState<TabInterface[]>([])

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
          const networksByTab: Map<number, Set<string>> = new Map()
          bg.uiInterface.chains.forEach((app) => {
            if (!networksByTab.has(app.tabId))
              networksByTab.set(app.tabId, new Set())
            networksByTab.get(app.tabId)!.add(app.chainName)
          })

          const nextTabs: TabInterface[] = []
          browserTabs.forEach((tab) => {
            if (!networksByTab.has(tab.id!)) return
            const result = {
              tabId: tab.id!,
              url: tab.url,
              networks: [...networksByTab.get(tab.id!)!],
            }
            if (tab.active) setActiveTab(result)
            else nextTabs.push(result)
          })

          setOtherTabs(nextTabs)
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

  return (
    <main className="w-80">
      <header className="py-1.5 my-3 mx-6 flex justify-between border-neutral-200 border-b">
        <Logo />
        <MdOutlineSettings
          onClick={goToOptions}
          className="cursor-pointer text-base"
        />
      </header>

      {activeTab && (
        <ConnectedTab
          disconnectTab={disconnectTabRef.current}
          current
          tab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}

      {otherTabs.length > 0 && (
        <div className="my-1">
          {otherTabs.map((t) => (
            <ConnectedTab
              disconnectTab={disconnectTabRef.current}
              key={t.tabId}
              tab={t}
            />
          ))}
        </div>
      )}
      <button
        className="capitalize px-2 py-1.5 my-3 mx-4 hover:bg-stone-200 text-sm w-11/12 flex justify-between font-light font-inter"
        onClick={() =>
          chrome.tabs.update({
            url: "https://paritytech.github.io/substrate-connect/#extension",
          })
        }
      >
        <div>About</div>
        <div>
          <MdCallMade className="text-base" />
        </div>
      </button>
    </main>
  )
}

export default Popup
