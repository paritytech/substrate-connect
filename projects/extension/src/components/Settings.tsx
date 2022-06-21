import React, { ReactNode, useEffect, useRef, useState } from "react"
import { BsThreeDots } from "react-icons/bs"
import { Background } from "../background"
import Loader from "./Loader"

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

const usePrevious = (v: any) => {
  const ref = useRef()
  useEffect(() => {
    ref.current = v
  }, [v])
  return ref.current
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

  const prevBootnode = usePrevious(bootnode)

  useEffect(() => {
    prevBootnode !== bootnode && setChecked(true)
  }, [bootnode])

  return (
    <input
      className="w-4 h-4 text-green-600 bg-gray-100 rounded border-gray-300 focus:ring-green-500
      focus:ring-green-600 ring-offset-gray-800 focus:ring-2 bg-gray-700 border-gray-600 cursor-pointer
      mr-4 leading-3 accent-[#24cc85]"
      type="checkbox"
      checked={checked}
      onChange={() => {
        alterBootnodes(bootnode, !checked, defaultBootnode)
        setChecked(!checked)
      }}
    />
  )
}

export const Settings = () => {
  const [disabledSaveButton, setDisabledSaveButton] = useState<boolean>(true)
  const [bg, setBg] = useState<Background>()
  const [bootnodes, setBootnodes] = useState<Record<string, string[]>>()
  const [selectedChain, setSelectedChain] = useState<string>("polkadot")
  const [defaultBn, setDefaultBn] = useState<BootnodesType[]>([])
  const [customBn, setCustomBn] = useState<BootnodesType[]>([])
  const [customBnInput, setCustomBnInput] = useState<string>("")
  const [defaultWellKnownChainBn, setDefaultWellKnownChainBn] =
    useState<string[]>()

  useEffect(() => {
    // If BackgroundPage is called multiple times in the same page, the extension's context will become invalidated
    // thus its called only during page construction and is saved in a state variable
    chrome.runtime.getBackgroundPage((backgroundPage) => {
      const background = backgroundPage as Background
      setBg(background)
    })
  }, [])

  useEffect(() => {
    const getBootnodes = async () => {
      setBootnodes(await bg?.uiInterface.wellKnownChainBootnodes)
    }
    // Whenever the save Button gets disabled (meaning it was called or upon init)
    // reload the bootnodes from the background script
    disabledSaveButton && getBootnodes()
  }, [bg, disabledSaveButton])

  useEffect(() => {
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
    setDefaultWellKnownChainBn(
      bg?.uiInterface.getDefaultBootnodes(selectedChain),
    )
  }, [bg, bootnodes, selectedChain])

  const alterBootnodes = (
    bootnode: string,
    add: boolean,
    defaultBootnode?: boolean,
  ) => {
    if (defaultBootnode) {
      const tmpDef = [...defaultBn]
      const i = defaultBn.findIndex((b) => b.bootnode === bootnode)
      tmpDef[i].checked = add
      setDefaultBn(tmpDef)
      disabledSaveButton && setDisabledSaveButton(false)
    } else {
      const custTmp = [...customBn]
      const i = custTmp.findIndex((b) => b.bootnode === bootnode)
      if (i !== -1) {
        custTmp[i].checked = add
      } else {
        custTmp.push({ bootnode, checked: true })
      }
      setCustomBn(custTmp)
      disabledSaveButton && setDisabledSaveButton(false)
    }
  }

  return (
    <div className="bg-white border border-neutral-200 p-4 rounded-md">
      {/* Network selection */}
      <Title titleType="large">Bootnodes</Title>
      <Title>Network</Title>
      <div className="networkSelect">
        <select
          onChange={(v) => {
            setSelectedChain(v.target.value)
            setDisabledSaveButton(true)
            setCustomBnInput("")
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
        {defaultBn.map((d) => (
          <div className="leading-4 flex items-center mb-2">
            <CheckBox
              bootnode={d.bootnode}
              alterBootnodes={alterBootnodes}
              defaultBootnode={true}
              isChecked={
                defaultWellKnownChainBn?.includes(d.bootnode) || d.checked
              }
            />
            <div>{d.bootnode}</div>
          </div>
        ))}
        {JSON.stringify(defaultWellKnownChainBn?.sort()) !==
          JSON.stringify(defaultBn.map((a) => a.bootnode).sort()) && (
          <button
            className="py-3 text-xs px-8 font-bold border border-[#24cc85] rounded text-white bg-[#24cc85]
            hover:text-[#24cc85] hover:bg-white capitalize disabled:border-gray-200 disabled:text-white
            disabled:bg-gray-200"
            onClick={() => {
              const defaults: BootnodesType[] = []
              defaultWellKnownChainBn?.forEach((bootnode) => {
                defaults.push({ bootnode, checked: true })
              })
              setDefaultBn(defaults)
              setDisabledSaveButton(false)
            }}
          >
            Restore Default Bootnodes
          </button>
        )}
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
            onChange={(v) => setCustomBnInput(v.target.value)}
          />
          <button
            className="py-1.5 text-sm px-8 border border-[#24cc85] rounded text-[#24cc85] hover:text-white
            hover:bg-[#24cc85] capitalize ml-4 disabled:border-gray-200 disabled:text-white disabled:bg-gray-200"
            disabled={!customBnInput}
            onClick={() => {
              alterBootnodes(customBnInput, true)
              setCustomBnInput("")
            }}
          >
            Add
          </button>
        </div>
        <button
          disabled={disabledSaveButton}
          className="py-3 text-xs px-8 font-bold border border-[#24cc85] rounded text-white bg-[#24cc85]
          hover:text-[#24cc85] hover:bg-white capitalize w-28 disabled:border-gray-200 disabled:text-white
          disabled:bg-gray-200"
          onClick={() => {
            const tmpDefault = [...defaultBn].filter((a) => a.checked)
            const tmpCustom = [...customBn].filter((a) => a.checked)
            const bn = [...tmpDefault, ...tmpCustom].map((b) => {
              if (b.checked) return b.bootnode
            }) as string[]
            bg?.uiInterface.updateBootnodes(selectedChain, bn)
            setDefaultBn(tmpDefault)
            setCustomBn(tmpCustom)
            setDisabledSaveButton(true)
          }}
        >
          Save
        </button>
      </div>
    </div>
  )
}
