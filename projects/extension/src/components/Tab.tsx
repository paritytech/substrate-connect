import React, { FunctionComponent, SetStateAction, Dispatch } from "react"
import { MdBlock } from "react-icons/md"
import { TabInterface } from "../types"
import "../main.css"

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
              <div
                className="networkicon_container"
                style={{ color: "text-neutral-500" }}
              >
                <div className="icon txt-lg mr-1">{n.toLowerCase()}</div>
              </div>
            ))}
            <div data-testid="Tooltip" className="tooltip">
              <span className="tooltiptext text-xs font-medium rounded shadow-lg p-1 bg-gray-100 tooltip_left">
                Disconnect app
              </span>
              <MdBlock
                className="text-base text-red-500 ml-2"
                onClick={onDisconnect}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Tab
