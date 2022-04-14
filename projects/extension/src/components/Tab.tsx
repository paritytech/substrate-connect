import React, { FunctionComponent, SetStateAction, Dispatch } from "react"
import BlockIcon from "@mui/icons-material/Block"
import { TabInterface } from "../types"
import { Tooltip, Network, NetworkIcon } from "mottled-library"

import "mottled-library/css/core.css"
import "mottled-library/css/NetworkIcon.css"
import "mottled-library/css/Tooltip.css"

interface TabProps {
  disconnectTab: (tabId: number) => void
  current?: boolean
  tab?: TabInterface
  setActiveTab?: Dispatch<SetStateAction<TabInterface | undefined>>
}

const Tab: FunctionComponent<TabProps> = ({
  disconnectTab,
  tab,
  current = false,
  setActiveTab,
}) => {
  /**
   * If Tab that initiated this function has a tabId (check for validity) then disconnectTab
   * function will be called to disconnect the tab. At the same time, in case the tan is marked as current
   * (meaning opened at the same window) - it is ensured that it will be removed from UI through passing setActiveTab
   * Dispatcher.
   **/
  const onDisconnect = (): void => {
    if (tab && tab.tabId) {
      disconnectTab(tab.tabId)
      if (setActiveTab && current) {
        setActiveTab(undefined)
      }
    }
  }

  return (
    <div
      className={`flex items-center justify-between font-roboto ${
        current ? "text-sm font-bold" : "text-sm"
      }`}
    >
      {tab && (
        <>
          <div className="truncate py-1.5 my-1.5 ml-6 w-7/12">{tab.url}</div>
          <div className="flex items-center right-6 absolute">
            {tab?.networks.map((n) => (
              <NetworkIcon
                cName="text-neutral-500"
                network={n.toLowerCase() as Network}
                show="icon"
                size="lg"
              />
            ))}
            <Tooltip
              text={"Disconnect app"}
              position={"left"}
              cName="text-xs font-medium"
            >
              <BlockIcon
                style={{ width: "1rem", marginLeft: "0.5rem", color: "red" }}
                onClick={onDisconnect}
              />
            </Tooltip>
          </div>
        </>
      )}
    </div>
  )
}

export default Tab
