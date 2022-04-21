import React, { FunctionComponent, useEffect, useRef, useState } from "react"
import * as material from "@material-ui/core"
import GlobalFonts from "../fonts/fonts"
import { light, MenuButton, Tab, Logo } from "../components"
import CallMadeIcon from "@material-ui/icons/CallMade"
import { Background } from "../background/"
import { TabInterface } from "../types"

const { createTheme, ThemeProvider, Box, Divider } = material

const Popup: FunctionComponent = () => {
  const disconnectTabRef = useRef<(tapId: number) => void>((_: number) => {})
  const [activeTab, setActiveTab] = useState<TabInterface | undefined>()
  const [otherTabs, setOtherTabs] = useState<TabInterface[]>([])
  const appliedTheme = createTheme(light)

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
    <ThemeProvider theme={appliedTheme}>
      <Box width={"320px"} pl={1.5} pr={1.5}>
        <GlobalFonts />
        <Box pt={2} pb={1} pl={1} pr={1}>
          <Logo />
        </Box>

        {activeTab && (
          <Tab
            disconnectTab={disconnectTabRef.current}
            current
            tab={activeTab}
            setActiveTab={setActiveTab}
          />
        )}

        {otherTabs.length > 0 && (
          <Box marginY={1}>
            {otherTabs.map((t) => (
              <>
                <Tab
                  disconnectTab={disconnectTabRef.current}
                  key={t.tabId}
                  tab={t}
                />
                <Divider />
              </>
            ))}
          </Box>
        )}
        <MenuButton fullWidth onClick={goToOptions}>
          Options
        </MenuButton>
        <Divider />
        <MenuButton
          fullWidth
          endIcon={<CallMadeIcon />}
          onClick={() =>
            chrome.tabs.update({
              url: "https://paritytech.github.io/substrate-connect/#extension",
            })
          }
        >
          About
        </MenuButton>
        {/* 
        /**
         * If "Stop all connections" button is pressed then disconnectAll 
         * function will be called to disconnect all apps.
          <MenuButton fullWidth className='danger' onClick={(): void => { uiInterface?.disconnectAll(); }}>Stop all connections</MenuButton>
        */}
      </Box>
    </ThemeProvider>
  )
}

export default Popup
