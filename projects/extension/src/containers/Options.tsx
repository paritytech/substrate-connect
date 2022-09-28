import React, { SetStateAction, useEffect, useState } from "react"
import pckg from "../../package.json"
import { Logo, NetworkTab, Loader, Tabs } from "../components/"
import { Background } from "../background/"

import { NetworkTabProps } from "../types"
import { TabsContent } from "../components/Tabs"
import { BraveModal } from "../components/BraveModal"
import { ClientError } from "../components/ClientError"

import { ImPause, ImPlay2 } from "react-icons/im"
import { TbCopy } from "react-icons/tb"

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
  const [actionResult, setActionResult] = useState<string>("")

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
            apps: tab ? [{ name: tab.url, url: tab.url }] : [],
          })
        }

        if (tab) network.apps.push({ name: tab.url, url: tab.url })
      })
      setNetworks([...networks.values()])
    }

    const cb = bg.uiInterface.onChainsChanged(refresh)
    const errCb = bg.uiInterface.onSmoldotCrashErrorChanged(() =>
      setClientError(bg.uiInterface.smoldotCrashError),
    )
    setClientError(bg.uiInterface.smoldotCrashError)
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

  useEffect(() => {
    const resetText = setTimeout(() => {
      setActionResult("")
    }, 4000)
    return () => clearTimeout(resetText)
  }, [actionResult])

  const getLevelInfo = (level: number): [string, string, string] => {
    let color: string = "#999"
    let desc: string = "Trace"
    let classList: string = "px-2 w-[3rem] inline-flex font-bold"
    switch (level) {
      case 0:
      case 1:
        color = "#c90a00"
        classList += " capitalize text-[#c90a00]"
        desc = "Error"
        break
      case 2:
        color = "#fb8500"
        classList += " capitalize text-[#fb8500]"
        desc = "Warn"
        break
      case 3:
        color = "#000"
        classList += " text-[#000]"
        desc = "Info"
        break
      case 4:
        color = "#8a817c"
        classList += " text-[#8a817c]"
        desc = "Debug"
        break
    }
    return [desc, color, classList]
  }

  return (
    <>
      <BraveModal show={showModal} isOptions={true} />
      <div className="mb-4">
        <div className="options-container">
          <div className="px-12 pb-3.5 text-base flex items-center font-roboto">
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
            <section className="font-roboto">
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
            <section className="block border border-[#ECECEC] bg-white rounded-lg px-5 py-2">
              <div className="flex mt-5 font-roboto">
                <div className="py-2.5 px-2 text-xl font-bold">
                  {errLogs.length} Errors,
                </div>
                <div className="py-2.5 px-2 text-xl font-bold">
                  {warnLogs.length} Warnings
                </div>
              </div>
              <div
                style={{ height: "70vh" }}
                className="block w-full overflow-y-auto px-2 text-black text-xs !font-monospace"
              >
                {allLogs.length > 0 ? (
                  allLogs
                    .map(
                      (
                        {
                          unix_timestamp,
                          level,
                          target,
                          message,
                        }: logStructure,
                        i: number,
                      ) => (
                        <p key={"all_" + i}>
                          <span>{getTime(unix_timestamp)}</span>
                          <div className={getLevelInfo(level)[2]}>
                            {getLevelInfo(level)[0]}
                          </div>
                          <span className="my-[0rem] mx-[0.5rem]">
                            [{target}]
                          </span>
                          <span>{message}</span>
                        </p>
                      ),
                    )
                    .reverse()
                ) : (
                  <div
                    style={{ height: "50vh" }}
                    className="items-center flex justify-center"
                  >
                    <Loader />
                  </div>
                )}
              </div>
              <div className="flex justify-center">
                <div className="px-5 py-2 border border-[#ECECEC] rounded-md mt-5 mb-2 self-center flex justify-center w-64">
                  <button
                    className="p-2 text-black	hover:text-green-500"
                    onClick={() => {
                      setPoolingLogs(!poolingLogs)
                      setActionResult(
                        poolingLogs ? "Logs paused" : "Logs running",
                      )
                    }}
                  >
                    {poolingLogs ? (
                      <ImPause className="w-7 h-7 mx-7" />
                    ) : (
                      <ImPlay2 className="w-7 h-7 mx-7" />
                    )}
                  </button>
                  <button
                    className="p-2 text-black	hover:text-green-500"
                    onClick={() => {
                      navigator.clipboard.writeText(stringifyLogs())
                      setActionResult("Copied to clipboard")
                    }}
                  >
                    <TbCopy className="w-7 h-7 mx-7" />
                  </button>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="self-center flex justify-center w-64 text-green-500 font-bold">
                  {actionResult}
                </div>
              </div>
            </section>
          </TabsContent>
        </div>
      </div>
    </>
  )
}

export default Options
