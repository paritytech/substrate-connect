import React, { ReactNode, useEffect, useState } from "react"
import { BsThreeDots } from "react-icons/bs"
import { Background } from "../background"

import "./Settings.css"

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

interface CheckBoxProps {
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

const CheckBox = ({
  bootnode,
  alterBootnodes,
  defaultBootnode,
  isChecked,
}: CheckBoxProps) => {
  const [checked, setChecked] = useState<boolean>(isChecked)

  useEffect(() => {
    setChecked(isChecked)
  }, [isChecked])

  return (
    <input
      readOnly
      className="w-4 h-4 text-green-600 bg-gray-100 rounded border-gray-300 focus:ring-green-500
      focus:ring-green-600 ring-offset-gray-800 focus:ring-2 bg-gray-700 border-gray-600 cursor-pointer
      mr-4 leading-3 accent-[#24cc85]"
      type="checkbox"
      defaultChecked={checked}
      checked={checked}
      onChange={() => {
        alterBootnodes(bootnode, !checked, defaultBootnode)
        setChecked(!checked)
      }}
    />
  )
}

export const Settings = () => {
  const [bg, setBg] = useState<Background>()
  const [bootnodes, setBootnodes] = useState<Record<string, string[]>>()
  const [selectedChain, setSelectedChain] = useState<string>("polkadot")
  const [defaultBn, setDefaultBn] = useState<BootnodesType[]>([])
  const [customBn, setCustomBn] = useState<BootnodesType[]>([])
  const [customBnInput, setCustomBnInput] = useState<string>("")
  const [defaultWellKnownChainBn, setDefaultWellKnownChainBn] =
    useState<string[]>()

  const [addMessage, setAddMessage] = useState<any>(undefined)
  const [loaderAdd, setLoaderAdd] = useState<boolean>(false)
  const [bootnodeMsgClass, setBootnodeMsgClass] = useState<string>()

  useEffect(() => {
    if (addMessage && !addMessage?.error) {
      setBootnodeMsgClass("pb-2 text-green-600")
      alterBootnodes(
        customBnInput,
        true,
        defaultBn.findIndex((b) => b.bootnode === customBnInput) > -1,
      )
      setCustomBnInput("")
    } else {
      setBootnodeMsgClass("pb-2 text-red-600")
    }
    setLoaderAdd(false)
  }, [addMessage, customBnInput, defaultBn])

  useEffect(() => {
    // If BackgroundPage is called multiple times in the same page, the extension's context will become invalidated
    // thus its called only during page construction and is saved in a state variable
    chrome.runtime.getBackgroundPage((backgroundPage) => {
      const background = backgroundPage as Background
      setBg(background)
      setDefaultWellKnownChainBn(
        background?.uiInterface.getDefaultBootnodes(selectedChain),
      )
    })
  }, [selectedChain])

  useEffect(() => {
    const getBootnodes = async () => {
      setBootnodes(await bg?.uiInterface.wellKnownChainBootnodes)
    }
    getBootnodes()
    const tmpDef: BootnodesType[] = []
    const tmpCust: BootnodesType[] = []
    if (bootnodes) {
      bootnodes[selectedChain].forEach((b) => {
        const defaultBootnodes =
          bg?.uiInterface.getDefaultBootnodes(selectedChain)
        defaultBootnodes?.length && defaultBootnodes?.includes(b)
          ? tmpDef.push({ bootnode: b, checked: true })
          : tmpCust.push({ bootnode: b, checked: true })
      })
      setDefaultBn(tmpDef)
      setCustomBn(tmpCust)
    }
  }, [bg, bootnodes, selectedChain])

  const alterBootnodes = async (
    bootnode: string,
    add: boolean,
    defaultBootnode?: boolean,
  ) => {
    if (!!bootnode) {
      // When checkbox is unclicked then the bootnode needs to be removed from the localStorage
      await bg?.uiInterface.updateBootnode(selectedChain, bootnode, add)
      const tmp = defaultBootnode ? [...defaultBn] : [...customBn]
      const i = tmp.findIndex((b) => b.bootnode === bootnode)
      if (i !== -1) {
        tmp[i].checked = add
      } else {
        tmp.push({ bootnode, checked: true })
      }
      defaultBootnode ? setDefaultBn(tmp) : setCustomBn(tmp)
      // disabledSaveButton && setDisabledSaveButton(false)
    }
  }

  return (
    <div className="bg-white border border-neutral-200 p-4 rounded-md">
      {/* Network selection */}
      <Title titleType="large">Bootnodes</Title>
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
      {/* Bootnodes selection */}
      <Title>Network Bootnodes</Title>
      <Title titleType="small">Default</Title>
      <div className="mb-8">
        {defaultWellKnownChainBn?.map((bn) => (
          <div className="leading-4 flex items-center mb-2">
            <CheckBox
              bootnode={bn}
              alterBootnodes={alterBootnodes}
              defaultBootnode={true}
              isChecked={defaultBn.map((d) => d.bootnode).includes(bn)}
            />
            <div>{bn}</div>
          </div>
        ))}
      </div>
      <Title titleType="small">Custom</Title>
      <div className="mb-8">
        {customBn.map((c) => (
          <div className="leading-4 flex items-center mb-2">
            <CheckBox
              bootnode={c.bootnode}
              alterBootnodes={alterBootnodes}
              defaultBootnode={false}
              isChecked={c.checked}
            />
            <div>{c.bootnode}</div>
          </div>
        ))}
      </div>
      {/* Add custom Bootnodes */}
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
              if (defaultWellKnownChainBn?.includes(customBnInput)) {
                setAddMessage({
                  error: true,
                  message: "Bootnode exists in the default list.",
                })
              } else {
                setLoaderAdd(true)
                setAddMessage(
                  await bg?.uiInterface.updateBootnode(
                    selectedChain,
                    customBnInput,
                    true,
                  ),
                )
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
  )
}
