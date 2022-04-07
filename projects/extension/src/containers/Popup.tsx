import React, { FunctionComponent, useEffect, useRef, useState } from "react"
import * as material from "@material-ui/core"
import GlobalFonts from "../fonts/fonts"
import { makeStyles } from "@material-ui/core/styles"
import { light, MenuButton, Tab, Logo } from "../components"
import CallMadeIcon from "@material-ui/icons/CallMade"
import { Background } from "../background/"
import { TabInterface } from "../types"
import { Tooltip } from "@material-ui/core"
import ErrorIcon from "@material-ui/icons/Error"
import ReplayIcon from "@material-ui/icons/Replay"

const { createTheme, ThemeProvider, Box, Divider } = material

const useStyles = makeStyles(() => ({
  flexBetween: {
    display: "flex",
    justifyContent: "space-between",
  },
  replayIcon: {
    width: "1.2rem",
    marginLeft: "0.2rem",
    color: "green",
    cursor: "pointer",
  },
  errorIcon: { width: "1.2rem", color: "red", cursor: "pointer" },
}))

const Popup: FunctionComponent = () => {
  const classes = useStyles()
  const disconnectTabRef = useRef<(tapId: number) => void>((_: number) => {})
  const [activeTab, setActiveTab] = useState<TabInterface | undefined>()
  const [otherTabs, setOtherTabs] = useState<TabInterface[]>([])
  const [crashError, setCrashError] = useState<string>("")
  const appliedTheme = createTheme(light)

  useEffect(() => {
    let isActive = true
    let unsubscribe = () => {}

    chrome.storage.local.get(["crashError"], (res) => {
      setCrashError(res.crashError)
    })
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

  return (
    <ThemeProvider theme={appliedTheme}>
      <Box width={"320px"} pl={1.5} pr={1.5}>
        <GlobalFonts />
        <Box pt={2} pb={1} pl={1} pr={1}>
          {crashError ? (
            <div className={classes.flexBetween}>
              <div>
                <Logo />
              </div>
              <div>
                <ErrorIcon
                  className={classes.errorIcon}
                  onClick={() => chrome.runtime.openOptionsPage()}
                />
                <Tooltip
                  placement="bottom"
                  title={"Click for manual reload of the extension"}
                >
                  <ReplayIcon
                    onClick={() => chrome.runtime.reload()}
                    className={classes.replayIcon}
                  />
                </Tooltip>
              </div>
            </div>
          ) : (
            <Logo />
          )}
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
        <MenuButton fullWidth onClick={() => chrome.runtime.openOptionsPage()}>
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
          <MenuButton fullWidth className='danger' onClick={(): void => { manager?.disconnectAll(); }}>Stop all connections</MenuButton>
        */}
      </Box>
    </ThemeProvider>
  )
}

export default Popup
