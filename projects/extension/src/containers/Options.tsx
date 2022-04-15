import React, { SetStateAction, useEffect, useState } from "react"

import { Logo, NetworkTab, Loader } from "../components/"
import { Background } from "../background/"

import { NetworkTabProps } from "../types"

import Switch from "@mui/material/Switch"
import FormGroup from "@mui/material/FormGroup"
import FormControlLabel from "@mui/material/FormControlLabel"
import FormControl from "@mui/material/FormControl"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import { makeStyles } from "@mui/styles"

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

interface StyledTabProps {
  label: string
}

interface logStructure {
  unix_timestamp: number
  level: number
  target: string
  message: string
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <div className="mt-4">{children}</div>}
    </div>
  )
}

const Options: React.FunctionComponent = () => {
  const [value, setValue] = useState<number>(0)
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
          const logs = (bg as Background).manager.getLogger()
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
      cb = bg.manager.onManagerStateChanged((apps) => {
        const networks = new Map<string, NetworkTabProps>()
        apps.forEach((app) => {
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
      })
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

  const handleChange = (
    event: React.ChangeEvent<unknown>,
    newValue: number,
  ) => {
    setValue(newValue)
  }

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
        color = "#f99602"
        desc = "Warn"
        break
      case 3:
        color = "#000"
        desc = "Info"
        break
      case 4:
        color = "#5e5e5e"
        desc = "Debug"
        break
    }
    return [desc, color]
  }

  return (
    <div className="font-roboto my-8 mx-12">
      <div className="pb-10 text-base">
        <Logo textSize="lg" />
      </div>
      <Tabs
        value={value}
        onChange={handleChange}
        indicatorColor="primary"
        textColor="secondary"
      >
        <Tab disableRipple label="Networks"></Tab>
        <Tab disableRipple label="Settings"></Tab>
        <Tab disableRipple label="Logs"></Tab>
      </Tabs>
      <TabPanel value={value} index={0}>
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
      </TabPanel>
      <TabPanel value={value} index={1}>
        <FormControl component="fieldset">
          <FormGroup aria-label="position" row>
            <FormControlLabel
              value="Notifications:"
              control={
                <Switch
                  checked={notifications}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNotifications(e.target.checked)
                  }
                  color="primary"
                  name="checkedB"
                  inputProps={{ "aria-label": "primary checkbox" }}
                />
              }
              label="Notifications:"
              labelPlacement="start"
            />
          </FormGroup>
        </FormControl>
      </TabPanel>
      <TabPanel value={value} index={2}>
        <div className="block">
          <div className="my-5 flex">
            <button
              className="border rounded-md px-2 bg-stone-200	hover:bg-stone-400"
              onClick={() => setPoolingLogs(!poolingLogs)}
            >
              {poolingLogs ? "Pause" : "Retrieve "} logs
            </button>
            <button
              className="my-0 mx-2 border rounded-md px-2 bg-stone-200	hover:bg-stone-400"
              onClick={() => navigator.clipboard.writeText(textifyLogs())}
            >
              Copy to clipboard
            </button>
            <div className="rounded-md bg-red-500	py-2.5 px-4">
              {errLogs.length} Errors
            </div>
            <div className="rounded-md bg-yellow-300 py-2.5 px-4 ml-2">
              {warnLogs.length} Warnings
            </div>
          </div>
          <div
            style={{ maxHeight: "80vh" }}
            className="overflow-y-auto block w-full"
          >
            {allLogs.length > 0 ? (
              allLogs.map(
                (
                  { unix_timestamp, level, target, message }: logStructure,
                  i: number,
                ) => (
                  <p key={"all_" + i} style={{ lineHeight: "1.2rem" }}>
                    <span
                      style={{
                        color: getLevelInfo(level)[1],
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                      }}
                    >
                      {getTime(unix_timestamp)}
                    </span>
                    <span
                      style={{
                        color: getLevelInfo(level)[1],
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                        margin: "0 0.5rem",
                      }}
                    >
                      {getLevelInfo(level)[0]}
                    </span>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        fontStyle: "oblique",
                        margin: "0 0.5rem",
                      }}
                    >
                      {target}
                    </span>
                    <span>{message}</span>
                  </p>
                ),
              )
            ) : (
              <div className="h-56 items-center ml-40 mt-20">
                <Loader />
              </div>
            )}
          </div>
        </div>
      </TabPanel>
    </div>
  )
}

export default Options
