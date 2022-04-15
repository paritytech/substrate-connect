import React, { FunctionComponent, useEffect, useRef, useState } from "react"

import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined"
import CallMadeIcon from "@mui/icons-material/CallMade"

import { Logo, Tab } from "../components"
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
        disconnectTabRef.current = bg.manager.disconnectTab

        unsubscribe = bg.manager.onManagerStateChanged((apps) => {
          const networksByTab: Map<number, Set<string>> = new Map()
          apps.forEach((app) => {
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
        })
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
    <div className="w-80">
      <div className="py-1.5 my-3 mx-6 flex justify-between border-neutral-200 border-b">
        <Logo />
        <SettingsOutlinedIcon
          onClick={goToOptions}
          className="cursor-pointer"
        />
      </div>

      {activeTab && (
        <Tab
          disconnectTab={disconnectTabRef.current}
          current
          tab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}

      {otherTabs.length > 0 && (
        <div className="my-1">
          {otherTabs.map((t) => (
            <>
              <Tab
                disconnectTab={disconnectTabRef.current}
                key={t.tabId}
                tab={t}
              />
            </>
          ))}
        </div>
      )}
      <button
        style={{ width: "-webkit-fill-available" }}
        className="capitalize px-2 py-1.5 my-3 mx-4 hover:bg-stone-200 text-sm flex justify-between font-light font-inter"
        onClick={() =>
          chrome.tabs.update({
            url: "https://paritytech.github.io/substrate-connect/#extension",
          })
        }
      >
        <div>About</div>
        <div>
          <CallMadeIcon />
        </div>
      </button>
    </div>
  )
}

export default Popup
