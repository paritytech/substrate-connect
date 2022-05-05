import React, { SetStateAction, useEffect, useState } from "react"
import pckg from "../../package.json"
import { Logo, NetworkTab, Loader, Tabs } from "../components/"
import { Background } from "../background/"

import { NetworkTabProps } from "../types"

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

  const getTime = (d: number) => {
    const date = new Date(d)
    return `${("0" + date.getHours()).slice(-2)}:${(
      "0" + date.getMinutes()
    ).slice(-2)}:${("0" + date.getSeconds()).slice(-2)} ${(
      "00" + date.getMilliseconds()
    ).slice(-3)}`
  }

  const textifyLogs = () => {
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
    const interval = setInterval(() => {
      if (poolingLogs) {
        chrome.runtime.getBackgroundPage((bg) => {
          const logs = (bg as Background).uiInterface.logger
          setAllLogs([...logs.all])
          setWarnLogs([...logs.warn])
          setErrLogs([...logs.error])
        })
      }
    }, 5000)
    return () => {
      clearInterval(interval)
    }
  }, [poolingLogs])

  useEffect(() => {
    chrome.storage.local.get(["notifications"], (res) => {
      setNotifications(res.notifications as SetStateAction<boolean>)
    })

    let cb: () => void = () => {}
    chrome.runtime.getBackgroundPage((backgroundPage) => {
      const bg = backgroundPage as Background
      const refresh = () => {
        const networks = new Map<string, NetworkTabProps>()
        bg.uiInterface.chains.forEach((app) => {
          const network = networks.get(app.chainName)
          if (!network) {
            return networks.set(app.chainName, {
              name: app.chainName,
              health: {
                isSyncing: app.isSyncing,
                peers: app.peers,
                status: "connected",
              },
              apps: [{ name: app.url, url: app.url }],
            })
          }

          network.apps.push({ name: app.url, url: app.url })
        })
        setNetworks([...networks.values()])
      }
      cb = bg.uiInterface.onChainsChanged(refresh)
      refresh()
    })

    return () => cb()
  }, [])

  useEffect(() => {
    chrome.storage.local.set({ notifications: notifications }, () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError)
      }
    })
  }, [notifications])

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
    <div className="mx-12 my-8 font-roboto">
      <div className="pb-3.5 text-base flex">
        <Logo textSize="lg" />
        <div className="pl-4 text-sm leading-6">v{pckg.version}</div>
      </div>
      <Tabs tabTitles={["Networks", "Logs"]}>
        <section>
          {networks.length ? (
            networks.map((network: NetworkTabProps, i: number) => {
              const { name, health, apps } = network
              return (
                <NetworkTab key={i} name={name} health={health} apps={apps} />
              )
            })
          ) : (
            <div>No networks or apps are connected to the extension.</div>
          )}
        </section>
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
              onClick={() => navigator.clipboard.writeText(textifyLogs())}
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
            style={{ maxHeight: "70vh" }}
            className="block w-full overflow-y-auto px-2 bg-black text-white text-base border border-black font-mono font"
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
      </Tabs>
    </div>
  )
}

export default Options
