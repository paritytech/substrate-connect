import React, { SetStateAction, useEffect, useState } from "react"
import pckg from "../../package.json"
import { Logo, NetworkTab, Loader, Tabs } from "../components/"
import { Background } from "../background/"

import { NetworkTabProps } from "../types"
import { TabsContent } from "../components/Tabs"
import { BraveModal } from "../components/BraveModal"
import { ClientError } from "../components/ClientError"

interface logStructure {
  unix_timestamp: number
  level: number
  target: string
  message: string
}

const Options: React.FunctionComponent = () => {
  const [networks, setNetworks] = useState<NetworkTabProps[]>([])
  const [notifications, setNotifications] = useState<boolean>(false)
  const [allLogs, setAllLogs] = useState<logStructure[]>([])
  const [warnLogs, setWarnLogs] = useState<logStructure[]>([])
  const [errLogs, setErrLogs] = useState<logStructure[]>([])
  const [poolingLogs, setPoolingLogs] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState<number>(0)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [bg, setBg] = useState<Background | undefined>()

  const [clientError, setClientError] = useState<string | undefined>(undefined)

  const getTime = (d: number) => {
    const date = new Date(d)
    return `${("0" + date.getHours()).slice(-2)}:${(
      "0" + date.getMinutes()
    ).slice(-2)}:${("0" + date.getSeconds()).slice(-2)} ${(
      "00" + date.getMilliseconds()
    ).slice(-3)}`
  }

  const stringifyLogs = () => {
    return allLogs
      .map(
        (a: logStructure) =>
          getTime(a.unix_timestamp) +
          " " +
          getLevelInfo(a.level)[0] +
          " - " +
          a.target +
          " " +
          a.message,
      )
      .join("\r\n")
  }

  useEffect(() => {
    chrome.runtime.getBackgroundPage((backgroundPage) => {
      setBg(backgroundPage as Background)
    })
  }, [])

  useEffect(() => {
    if (!bg) return
    setClientError(bg?.uiInterface.smoldotCrashError)
    const interval = setInterval(() => {
      if (poolingLogs) {
        const logs = bg.uiInterface.logger
        setAllLogs([...logs.all])
        setWarnLogs([...logs.warn])
        setErrLogs([...logs.error])
      }
    }, 5000)
    return () => {
      clearInterval(interval)
    }
  }, [bg, poolingLogs])

  useEffect(() => {
    if (!bg) return

    const getNotifications = async () => {
      const result = await bg?.uiInterface.getChromeStorageLocalSetting(
        "notifications",
      )
      setNotifications(result?.notifications as SetStateAction<boolean>)
    }

    getNotifications()

    window.navigator?.brave?.isBrave().then(async (isBrave: any) => {
      const { braveSetting } =
        await bg.uiInterface.getChromeStorageLocalSetting("braveSetting")
      setShowModal(isBrave && !braveSetting)
    })

    const refresh = () => {
      const networks = new Map<string, NetworkTabProps>()
      bg.uiInterface.chains.forEach((chain) => {
        const { chainName, tab, isSyncing, peers, bestBlockHeight } = chain
        if (!tab) return

        const network = networks.get(chainName)
        if (!network) {
          return networks.set(chainName, {
            name: chainName,
            health: {
              isSyncing,
              peers,
              status: "connected",
              bestBlockHeight,
            },
            apps: [{ name: tab.url, url: tab.url }],
          })
        }

        network.apps.push({ name: tab.url, url: tab.url })
      })
      setNetworks([...networks.values()])
    }

    const cb = bg.uiInterface.onChainsChanged(refresh)
    const errCb = bg.uiInterface.onSmoldotCrashErrorChanged(() =>
      setClientError(bg?.uiInterface.smoldotCrashError),
    )
    refresh()

    return () => {
      cb()
      errCb()
    }
  }, [bg])

  useEffect(() => {
    bg?.uiInterface.setChromeStorageLocalSetting({
      notifications: notifications,
    })
  }, [bg, notifications])

  const getLevelInfo = (level: number) => {
    let color: string = "#999"
    let desc: string = "Trace"
    switch (level) {
      case 0:
      case 1:
        color = "#c90a00"
        desc = "Error"
        break
      case 2:
        color = "#fde047"
        desc = "Warn"
        break
      case 3:
        color = "#fff"
        desc = "Info"
        break
      case 4:
        color = "#ccc"
        desc = "Debug"
        break
    }
    return [desc, color]
  }

  return (
    <>
      <BraveModal show={showModal} isOptions={true} />
      <div className="mb-4 font-roboto">
        <div className="options-container">
          <div className="px-12 pb-3.5 text-base flex items-center">
            <div className="flex items-baseline">
              <Logo textSize="lg" />
              <div className="text-sm pl-4">v{pckg.version}</div>
            </div>
            <div className="w-full ml-[10%]">
              <Tabs
                setActiveTab={(n: number) => setActiveTab(n)}
                tabTitles={["Networks", "Logs"]}
              />
            </div>
          </div>
        </div>
        <div className="mx-[15%] pt-2">
          {/** Networks section */}
          <TabsContent activeTab={activeTab}>
            <section>
              {clientError && <ClientError error={clientError} />}
              {networks.length ? (
                networks.map((network: NetworkTabProps, i: number) => {
                  const { name, health, apps } = network
                  return (
                    <NetworkTab
                      key={i}
                      name={name}
                      health={health}
                      apps={apps}
                    />
                  )
                })
              ) : (
                <div>No networks or apps are connected to the extension.</div>
              )}
            </section>
            {/** Logs section */}
            <section className="block">
              <div className="flex my-5">
                <button
                  className="px-2 border rounded-md bg-stone-200 hover:bg-stone-400"
                  onClick={() => setPoolingLogs(!poolingLogs)}
                >
                  {poolingLogs ? "Pause" : "Retrieve "} logs
                </button>
                <button
                  className="px-2 mx-2 my-0 border rounded-md bg-stone-200 hover:bg-stone-400"
                  onClick={() => navigator.clipboard.writeText(stringifyLogs())}
                >
                  Copy to clipboard
                </button>
                <div className="rounded-md bg-red-500 py-2.5 px-4">
                  {errLogs.length} Errors
                </div>
                <div className="ml-2 rounded-md bg-yellow-300 py-2.5 px-4">
                  {warnLogs.length} Warnings
                </div>
              </div>
              <div
                style={{ maxHeight: "75vh" }}
                className="block w-full overflow-y-auto px-2 bg-black text-white text-xs border border-black font-mono font"
              >
                {allLogs.length > 0 ? (
                  allLogs.map(
                    (
                      { unix_timestamp, level, target, message }: logStructure,
                      i: number,
                    ) => (
                      <p
                        key={"all_" + i}
                        style={{
                          color: getLevelInfo(level)[1],
                        }}
                      >
                        <span
                          style={{
                            fontWeight: "bold",
                          }}
                        >
                          [{getTime(unix_timestamp)}]
                        </span>
                        <span
                          style={{
                            margin: "0 0.5rem",
                          }}
                        >
                          [{target}]
                        </span>
                        <span>{message}</span>
                      </p>
                    ),
                  )
                ) : (
                  <div className="items-center h-56 mt-20 ml-40">
                    <Loader />
                  </div>
                )}
              </div>
            </section>
          </TabsContent>
        </div>
      </div>
    </>
  )
}

export default Options
