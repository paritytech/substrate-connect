import React, { useEffect, useState } from "react"
import pckg from "../../package.json"
import { MdOutlineNetworkCell, MdOutlineOnlinePrediction } from "react-icons/md"
import { FaGithub } from "react-icons/fa"
import * as environment from "../environment"
import { NetworkTabProps } from "../types"
import {
  BraveModal,
  Logo,
  MenuContent,
  Networks,
  Bootnodes,
} from "../components"

type MenuItemTypes = "item" | "title" | "icon"

const item = [
  "group",
  "flex",
  "items-center",
  "text-base",
  "py-4",
  "px-6",
  "h-12",
  "overflow-hidden",
  "text-ellipsis",
  "whitespace-nowrap",
  "rounded",
]
const itemInactive = [
  "hover:bg-gray-100",
  "transition",
  "duration-300",
  "ease-in-out",
]
const itemActive = ["bg-gray-100", "cursor-default"]
const title = ["ml-4 font-inter font-medium text-gray-600"]
const titleInactive = ["group-hover:text-gray-900"]
const titleActive = ["text-gray-900", "cursor-default"]
const iconInactive = ["text-gray-400", "group-hover:text-gray-900"]
const iconActive = ["text-gray-900", "cursor-default"]

const cName = (type: MenuItemTypes, menu = 0, reqMenu: number) => {
  let classes: string[] = []
  switch (type) {
    case "item":
      if (menu === reqMenu) {
        classes = [...item, ...itemActive]
      } else {
        classes = [...item, ...itemInactive]
      }
      break
    case "title":
      if (menu === reqMenu) {
        classes = [...title, ...titleActive]
      } else {
        classes = [...title, ...titleInactive]
      }
      break
    case "icon":
      if (menu === reqMenu) {
        classes = iconActive
      } else {
        classes = iconInactive
      }
      break
  }
  return classes.join(" ")
}

export const Options: React.FunctionComponent = () => {
  const [networks, setNetworks] = useState<NetworkTabProps[]>([])
  const [menu, setMenu] = useState<number>(0)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [actionResult, setActionResult] = useState<string>("")

  useEffect(() => {
    window.navigator?.brave?.isBrave().then(async (isBrave: any) => {
      const braveSetting = await environment.get({ type: "braveSetting" })
      setShowModal(isBrave && !braveSetting)
    })

    const refresh = () => {
      environment.getAllActiveChains().then((chains) => {
        const networks = new Map<string, NetworkTabProps>()
        ;(chains || []).forEach((chain) => {
          const {
            chainName,
            tab,
            isWellKnown,
            isSyncing,
            peers,
            bestBlockHeight,
          } = chain
          const key = (isWellKnown ? "wk" : "nwk") + chainName

          const network = networks.get(key)
          if (!network) {
            return networks.set(key, {
              name: chainName,
              isWellKnown,
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
      })
    }

    const unregister = environment.onActiveChainsChanged(() => refresh())
    refresh()
    return unregister
  }, [])

  useEffect(() => {
    const resetText = setTimeout(() => {
      setActionResult("")
    }, 4000)
    return () => clearTimeout(resetText)
  }, [actionResult])

  return (
    <>
      <BraveModal show={showModal} isOptions={true} />
      <div className="w-60 h-full shadow-md bg-white absolute">
        <div className="pt-4 pb-2 px-6">
          <div className="flex items-center">
            <div className="grow ml-3">
              <div className="flex items-baseline">
                <Logo textSize="base" />
              </div>
            </div>
          </div>
        </div>
        <ul className="relative px-1 pt-10">
          <li className="relative">
            <a
              className={cName("item", menu, 0)}
              href="#!"
              onClick={() => setMenu(0)}
            >
              <MdOutlineNetworkCell className={cName("icon", menu, 0)} />
              <span className={cName("title", menu, 0)}>Networks</span>
            </a>
          </li>
          <li className="relative">
            <a
              className={cName("item", menu, 1)}
              href="#!"
              onClick={() => setMenu(1)}
            >
              <MdOutlineOnlinePrediction className={cName("icon", menu, 1)} />
              <span className={cName("title", menu, 1)}>Bootnodes</span>
            </a>
          </li>
        </ul>
        <div className="text-center bottom-0 absolute w-full">
          <hr className="m-0" />
          <div className="block float-left py-4 px-2 cursor-pointer">
            <a
              rel="noreferrer"
              target="_blank"
              href="https://github.com/paritytech/substrate-connect"
            >
              <div className="block float-left px-3.5 text-3xl">
                <FaGithub />
              </div>
              <div className="block float-left text-xs text-left">
                <div className="text-gray-700">Substrate Connect on Github</div>
                <div className="text-gray-500">v {pckg.version}</div>
              </div>
            </a>
          </div>
        </div>
      </div>
      <div className="ml-60 absolute w-[calc(100%-15rem)] h-[100vh] overflow-auto">
        <MenuContent activeMenu={menu}>
          {/** Networks section */}
          <Networks networks={networks} />
          {/**Bootnodes section */}
          <Bootnodes />
        </MenuContent>
      </div>
    </>
  )
}
