import { FunctionComponent, useEffect, useMemo, useState } from "react"
import { MdOutlineNetworkCell, MdOutlineOnlinePrediction } from "react-icons/md"
import pckg from "../../package.json"
import { FaGithub } from "react-icons/fa"
import * as environment from "../environment"
import { BraveModal, Logo, MenuContent, Bootnodes } from "../components"
import { Link } from "react-router-dom"
import { useActiveChains } from "@/hooks/useActiveChains"
import { NetworkTabProps } from "@/types"
import { NetworkTab } from "./WalletPopup/components"
import { Accordion } from "@/components/ui/accordion"
import { ChainSpecs } from "./WalletPopup/pages/Options/ChainSpecs"

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

const Networks: React.FC = () => {
  const chains = useActiveChains()

  const networks: NetworkTabProps[] = useMemo(
    () =>
      chains.map(({ chainName, isWellKnown, details }) => {
        return {
          isWellKnown,
          name: chainName,
          health: {
            isSyncing: details[0].isSyncing,
            peers: details[0].peers,
            status: "connected",
            bestBlockHeight: details[0].bestBlockHeight,
          },
          apps: details.map(({ url }) => ({
            name: url ?? "",
            url: url,
          })),
        }
      }),
    [chains],
  )

  return (
    <section className="container">
      <h2 className="pb-2 space-y-2 text-3xl font-semibold md:pb-4">
        Networks
      </h2>
      {networks.length ? (
        <Accordion type="multiple" className="w-full">
          {networks.map(({ name, health, apps, isWellKnown }, i) => (
            <NetworkTab
              key={i}
              name={name}
              health={health}
              isWellKnown={isWellKnown}
              apps={apps}
            />
          ))}
        </Accordion>
      ) : (
        <div>The extension isn't connected to any network.</div>
      )}
    </section>
  )
}

export const Options: FunctionComponent = () => {
  const [menu, setMenu] = useState<0 | 1 | 2>(0)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [actionResult, setActionResult] = useState<string>("")

  useEffect(() => {
    window.navigator?.brave?.isBrave().then(async (isBrave: any) => {
      const braveSetting = await environment.get({ type: "braveSetting" })
      setShowModal(isBrave && !braveSetting)
    })
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
      <div className="absolute h-full bg-white shadow-md w-60">
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center">
            <div className="ml-3 grow">
              <div className="flex items-baseline">
                <Logo textSize="base" />
              </div>
            </div>
          </div>
        </div>
        <ul className="relative px-1 pt-10">
          <li className="relative">
            <Link
              to=""
              className={cName("item", menu, 0)}
              onClick={() => setMenu(0)}
            >
              <MdOutlineNetworkCell className={cName("icon", menu, 0)} />
              <span className={cName("title", menu, 0)}>Networks</span>
            </Link>
          </li>
          <li className="relative">
            <Link
              to=""
              className={cName("item", menu, 1)}
              onClick={() => setMenu(1)}
            >
              <MdOutlineOnlinePrediction className={cName("icon", menu, 1)} />
              <span className={cName("title", menu, 1)}>Bootnodes</span>
            </Link>
          </li>
          <li className="relative">
            <Link
              to=""
              className={cName("item", menu, 2)}
              onClick={() => setMenu(2)}
            >
              <MdOutlineOnlinePrediction className={cName("icon", menu, 2)} />
              <span className={cName("title", menu, 2)}>Chainspecs</span>
            </Link>
          </li>
        </ul>
        <div className="absolute bottom-0 w-full text-center">
          <hr className="m-0" />
          <div className="block float-left px-2 py-4 cursor-pointer">
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
        <MenuContent>
          {menu === 0 ? (
            <Networks />
          ) : menu === 1 ? (
            <Bootnodes />
          ) : menu === 2 ? (
            <ChainSpecs />
          ) : null}
        </MenuContent>
      </div>
    </>
  )
}
