import React, { FunctionComponent, SetStateAction, Dispatch } from "react"
import { MdBlock } from "react-icons/md"
import { TabInterface } from "../types"
import "../main.css"

interface ConnectedAppProps {
  disconnectApp: (tabId: number) => void
  current?: boolean
  tab?: TabInterface
  setActiveTab?: Dispatch<SetStateAction<TabInterface | undefined>>
}

const knownChains = ["polkadot", "kusama", "westend", "rococo"]

const ConnectedApp: FunctionComponent<ConnectedAppProps> = ({
  disconnectApp,
  tab,
  current = false,
  setActiveTab,
}) => {
  /**
   * If Tab that initiated this function has a tabId (check for validity) then disconnectApp
   * function will be called to disconnect the tab. At the same time, in case the tan is marked as current
   * (meaning opened at the same window) - it is ensured that it will be removed from UI through passing setActiveTab
   * Dispatcher.
   **/
  const onDisconnect = (): void => {
    if (tab && tab.tabId) {
      disconnectApp(tab.tabId)
      if (setActiveTab && current) {
        setActiveTab(undefined)
      }
    }
  }

  return (
    <section
      className={`flex items-center justify-between font-roboto ${
        current ? "text-sm font-bold" : "text-sm"
      }`}
    >
      {tab && (
        <>
          <div className="truncate py-1.5 my-1.5 ml-6 w-7/12">{tab.url}</div>
          <div className="flex items-center right-6 absolute bg-white">
            {tab?.networks.map((n) => (
              <div
                className="networkicon_container"
                style={{ color: "text-neutral-500" }}
              >
                <div className="icon txt-lg mr-1">
                  {knownChains.includes(n.toLowerCase())
                    ? n.toLowerCase()
                    : "?"}
                </div>
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
    </section>
  )
}

export default ConnectedApp
