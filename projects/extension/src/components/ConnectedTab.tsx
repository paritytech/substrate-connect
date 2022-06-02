import React, { FunctionComponent, SetStateAction, Dispatch } from "react"
import { MdBlock } from "react-icons/md"
import { TabInterface } from "../types"
import "../main.css"
import IconWeb3 from "./IconWeb3"

interface ConnectedTabProps {
  disconnectTab: (tabId: number) => void
  current?: boolean
  tab?: TabInterface
  setActiveTab?: Dispatch<SetStateAction<TabInterface | undefined>>
}

const knownChains = ["polkadot", "kusama", "westend", "rococo"]

const ConnectedTab: FunctionComponent<ConnectedTabProps> = ({
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
    <section
      className={`font-roboto flex items-center justify-between ${
        current ? "text-sm font-bold" : "text-sm"
      }`}
    >
      {tab && (
        <>
          <div className="my-1.5 ml-6 w-7/12 truncate py-1.5">{tab.url}</div>
          <div className="absolute flex items-center bg-white right-6">
            {tab?.networks.map((n) => (
              <div
                className="networkicon_container"
                style={{ color: "text-neutral-500" }}
              >
                <IconWeb3>n.toLowerCase()</IconWeb3>
              </div>
            ))}
            <div className="tooltip">
              <span className="p-1 text-xs font-medium bg-gray-100 rounded shadow-lg tooltiptext tooltip_left">
                Disconnect app
              </span>
              <MdBlock
                className="ml-2 text-base text-red-500"
                onClick={onDisconnect}
              />
            </div>
          </div>
        </>
      )}
    </section>
  )
}

export default ConnectedTab
