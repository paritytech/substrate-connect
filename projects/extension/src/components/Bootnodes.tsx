import React, { ReactNode, useEffect, useState } from "react"
import { BsThreeDots } from "react-icons/bs"
import * as environment from "../environment"

import "./Bootnodes.css"

type manipulateBootnodeType = (
  bootnode: string,
  add: boolean,
  defaultBootnode: boolean,
) => void

interface TitleProps {
  children: ReactNode
  titleType?: "small" | "normal" | "large"
  showOptions?: boolean
}

interface SwitchProps {
  bootnode: string
  alterBootnodes: manipulateBootnodeType
  defaultBootnode: boolean
  isChecked: boolean
}

interface BootnodesType {
  checked: boolean
  bootnode: string
}

const Title = ({
  children,
  titleType = "normal",
  showOptions = false,
}: TitleProps) => {
  const cName =
    titleType === "small"
      ? "text-sm text-neutral-500"
      : titleType === "large"
      ? "text-lg font-bold"
      : "text-base font-bold"
  return (
    <div className={"flex justify-between mb-4 ".concat(cName)}>
      <div className="capitalize">{children}</div>
      {showOptions && <BsThreeDots className="cursor-pointer" />}
    </div>
  )
}

const Switch = ({
  bootnode,
  alterBootnodes,
  defaultBootnode,
  isChecked,
}: SwitchProps) => {
  const [checked, setChecked] = useState<boolean>(isChecked)

  useEffect(() => {
    setChecked(isChecked)
  }, [isChecked])

  return (
    <div className="flex w-1/12 ml-8">
      <label className="inline-flex relative items-center mr-5 cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          defaultChecked={checked}
          checked={checked}
          readOnly
        />
        <div
          onClick={() => {
            // alterBootnodes(bootnode, !checked, defaultBootnode)
            setChecked(!checked)
          }}
          className="w-11 h-6 bg-gray-200 rounded-full peer  peer-focus:ring-green-300  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#16DB9A]"
        ></div>
      </label>
    </div>
  )
}

interface Boot {
  [key: string]: string[]
}

const validateAddress = (input: string): boolean => {
  let regex = /^\/dns\/[A-Za-z0-9]\/tcp\/443\/wss\/p2p\/[A-Za-z0-9]$/i
  console.log("REGEX => ", regex.test(input))
  return regex.test(input)
}

export const Bootnodes = () => {
  const [bootnodes, setBootnodes] = useState<Boot>()
  const [selectedChain, setSelectedChain] = useState<string>("polkadot")
  const [defaultBn, setDefaultBn] = useState<BootnodesType[]>([])
  const [customBn, setCustomBn] = useState<BootnodesType[]>([])
  const [customBnInput, setCustomBnInput] = useState<string>("")
  const [defaultWellKnownChainBn, setDefaultWellKnownChainBn] = useState<
    string[]
  >([])

  const [addMessage, setAddMessage] = useState<any>(undefined)
  const [loaderAdd, setLoaderAdd] = useState<boolean>(false)
  const [bootnodeMsgClass, setBootnodeMsgClass] = useState<string>()

  useEffect(() => {
    // Load default Bootnodes and save them to localStorage
    environment.getBootnodes(selectedChain).then((a) => {
      setBootnodes({ [selectedChain]: a })
      setDefaultWellKnownChainBn(a)
    })
  }, [selectedChain])

  // Add to localstorage the given bootnode for the given chain
  const saveToLocalStorage = (
    chain: string,
    bootnode: string,
    add: boolean,
    def: string[],
  ) => {
    chrome.storage.local.get(["bootNodes_".concat(chain)], (result) => {
      let res: string[]
      if (def.length === 0) throw new Error("Default Bootnodes should exist.")
      res =
        result && Object.keys(result).length > 0
          ? [...result["bootNodes_".concat(chain)]]
          : [...def]
      add ? res.push(bootnode) : res.splice(res.indexOf(bootnode), 1)
      chrome.storage.local.set({
        ["bootNodes_".concat(chain)]: res,
      })
    })
  }

  useEffect(() => {
    if (addMessage && !addMessage?.error) {
      setBootnodeMsgClass("pb-2 text-green-600")
      setCustomBnInput("")
    } else {
      setBootnodeMsgClass("pb-2 text-red-600")
    }
    setLoaderAdd(false)
  }, [addMessage])

  useEffect(() => {
    console.log("selectedChain", selectedChain)
    const mpla = async () => {
      await environment.getBootnodes(selectedChain)
    }
    mpla()
  }, [selectedChain])

  useEffect(() => {
    const result = (c: string, b: string, res: string) => {
      if (!res) {
        saveToLocalStorage(c, b, true, defaultWellKnownChainBn)
      }
      setAddMessage({
        error: !!res,
        message: res || "Successfully added.",
      })
    }
    if (!defaultWellKnownChainBn) return
    console.log("result -> ", result)
    // bg.uiInterface.onBootnodeVerification(result)
    // TODO ADD VERIFICATIONOF BOOTNODE
  }, [defaultWellKnownChainBn])

  useEffect(() => {
    // const getBootnodes = async () => {
    //   setBootnodes()
    // }
    // getBootnodes()
    const tmpDef: BootnodesType[] = []
    const tmpCust: BootnodesType[] = []
    if (bootnodes) {
      console.log("bootnodes[selectedChain]", bootnodes, selectedChain)
      bootnodes[selectedChain] &&
        bootnodes[selectedChain].forEach((b) => {
          const defaultBootnodes =
            environment.getDefaultBootnodes(selectedChain)
          defaultBootnodes?.length && defaultBootnodes?.includes(b)
            ? tmpDef.push({ bootnode: b, checked: true })
            : tmpCust.push({ bootnode: b, checked: true })
        })
      setDefaultBn(tmpDef)
      setCustomBn(tmpCust)
    }
  }, [bootnodes, selectedChain])

  const alterBootnodes = async (
    bootnode: string,
    add: boolean,
    defaultBootnode: boolean,
  ) => {
    if (!!bootnode) {
      // if bootnode belongs to the list (default) then it does not need to be validated as it
      // comes from the chainspecs. It can be saved to the local storage at once.
      if (defaultBootnode) {
        saveToLocalStorage(
          selectedChain,
          bootnode,
          add,
          defaultWellKnownChainBn,
        )
      } else {
        // bg?.uiInterface.updateBootnode(selectedChain, bootnode, add)
        console.log(
          "bg?.uiInterface.updateBootnode(selectedChain, bootnode, add)",
        )
      }
      const tmp = defaultBootnode ? [...defaultBn] : [...customBn]
      const i = tmp.findIndex((b) => b.bootnode === bootnode)
      if (i !== -1) {
        tmp[i].checked = add
      } else {
        tmp.push({ bootnode, checked: true })
      }
      defaultBootnode ? setDefaultBn(tmp) : setCustomBn(tmp)
    }
  }

  return (
    <section className="mx-0 md:mx-12 xl:mx-36 2xl:mx-64 font-roboto max-w-5xl">
      <div className="font-inter font-bold text-3xl pb-4">Bootnodes</div>
      <div className="bg-white border border-neutral-200 p-4 rounded-md">
        {/* Network selection */}
        <Title>Network</Title>
        <div className="networkSelect">
          <select
            disabled={loaderAdd}
            onChange={(v) => {
              setSelectedChain(v.target.value)
              setCustomBnInput("")
              setAddMessage(undefined)
            }}
          >
            <option value="polkadot">Polkadot</option>
            <option value="ksmcc3">Kusama</option>
            <option value="westend2">Westend</option>
            <option value="rococo_v2_2">Rococo</option>
          </select>
          <span className="focus"></span>
        </div>
        <Title>Bootnodes</Title>
        <Title titleType="small">Default</Title>
        <div className="mb-8">
          {defaultWellKnownChainBn?.map((bn) => (
            <div className="leading-4 flex items-center mb-2 wrap">
              <div className="text-ellipsis overflow-hidden whitespace-nowrap w-11/12">
                {bn}
              </div>
              <Switch
                bootnode={bn}
                alterBootnodes={alterBootnodes}
                defaultBootnode={true}
                isChecked={defaultBn.map((d) => d.bootnode).includes(bn)}
              />
            </div>
          ))}
        </div>
        <Title titleType="small">Custom</Title>
        <div className="mb-8">
          {customBn.map((c) => (
            <div className="leading-4 flex items-center mb-2">
              <div className="text-ellipsis overflow-hidden whitespace-nowrap	">
                {c.bootnode}
              </div>
              <Switch
                bootnode={c.bootnode}
                alterBootnodes={alterBootnodes}
                defaultBootnode={false}
                isChecked={c.checked}
              />
            </div>
          ))}
        </div>
        <Title>Add custom Bootnode</Title>
        <div className="flex flex-col">
          <div className="flex flex-row mb-4">
            <input
              type="text"
              className="w-3/6 block px-2 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding
              border border-solid border-gray-300 rounded focus:text-gray-700 focus:bg-white focus:border-[#24cc85]
              focus:outline-none"
              placeholder="Enter bootnode address"
              value={customBnInput}
              onChange={(v) => {
                addMessage && setAddMessage(undefined)
                setCustomBnInput(v.target.value)
              }}
            />
            <button
              className="py-1.5 text-sm px-8 border border-[#24cc85] rounded text-[#24cc85] hover:text-white
              hover:bg-[#24cc85] capitalize ml-4 disabled:border-gray-200 disabled:text-white disabled:bg-gray-200"
              disabled={!customBnInput || loaderAdd}
              onClick={async () => {
                if (
                  defaultWellKnownChainBn?.includes(customBnInput) ||
                  customBn.map((c) => c.bootnode).includes(customBnInput)
                ) {
                  setAddMessage({
                    error: true,
                    message: "Bootnode already exists in the list.",
                  })
                } else {
                  console.log("validateAddress", validateAddress(customBnInput))
                  setLoaderAdd(true)
                  // bg?.uiInterface.updateBootnode(
                  //   selectedChain,
                  //   customBnInput,
                  //   true,
                  // )
                }
              }}
            >
              {loaderAdd ? "Loading..." : "Add"}
            </button>
          </div>
          <p className={bootnodeMsgClass}>
            {addMessage && Object.keys(addMessage) ? addMessage.message : ""}
          </p>
        </div>
      </div>
    </section>
  )
}
