import React, { useEffect, useState } from "react"
import { MdDeleteOutline } from "react-icons/md"
import * as environment from "../environment"

import "./Bootnodes.css"
import { Title, Switch } from "."
interface BootnodesType {
  checked: boolean
  bootnode: string
}

// Add to localstorage the given bootnode for the given chain
const saveToLocalStorage = async (
  chainName: string,
  bootnode: string,
  add: boolean,
  def: string[],
) => {
  if (def.length === 0) throw new Error("Default Bootnodes should exist.")
  let res: string[]
  const chainBootnodes = await environment.get({
    type: "bootnodes",
    chainName,
  })
  res =
    chainBootnodes && Object.keys(chainBootnodes).length > 0
      ? [...chainBootnodes]
      : [...def]
  add ? res.push(bootnode) : res.splice(res.indexOf(bootnode), 1)
  await environment.set({ type: "bootnodes", chainName }, res)
}

export const Bootnodes = () => {
  const [selectedChain, setSelectedChain] = useState<string>("polkadot")
  const [defaultBn, setDefaultBn] = useState<BootnodesType[]>([])
  const [customBn, setCustomBn] = useState<BootnodesType[]>([])
  const [customBnInput, setCustomBnInput] = useState<string>("")
  const [selectedChainDefaultBn, setSelectedChainDefaultBn] = useState<
    string[]
  >([])

  const [addMessage, setAddMessage] = useState<any>(undefined)
  const [bootnodeMsgClass, setBootnodeMsgClass] = useState<string>()

  useEffect(() => {
    // Load default Bootnodes
    const defChains = environment.getDefaultBootnodes(selectedChain)
    console.assert(defChains, "Invalid chain name: " + selectedChain)
    setSelectedChainDefaultBn(defChains || [])
  }, [selectedChain])

  useEffect(() => {
    if (addMessage && !addMessage?.error) {
      setBootnodeMsgClass("pb-2 text-green-600")
      setCustomBnInput("")
    } else {
      setBootnodeMsgClass("pb-2 text-red-600")
    }
  }, [addMessage])

  useEffect(() => {
    environment.getBootnodes(selectedChain).then((bootnodes) => {
      const tmpDef: BootnodesType[] = []
      const tmpCust: BootnodesType[] = []
      // When bootnodes do not exist assign and save the local ones
      if (!bootnodes?.length) {
        environment.set(
          { type: "bootnodes", chainName: selectedChain },
          selectedChainDefaultBn,
        )
        selectedChainDefaultBn.forEach((b) => {
          tmpDef.push({ bootnode: b, checked: true })
        })
      } else {
        bootnodes?.forEach((b) => {
          const defaultBootnodes =
            environment.getDefaultBootnodes(selectedChain)
          defaultBootnodes?.length && defaultBootnodes?.includes(b)
            ? tmpDef.push({ bootnode: b, checked: true })
            : tmpCust.push({ bootnode: b, checked: true })
        })
      }
      setDefaultBn(tmpDef)
      setCustomBn(tmpCust)
    })
  }, [selectedChain, selectedChainDefaultBn])

  const checkMultiAddr = (addr: string) => {
    const ws =
      /\/(ip4|ip6|dns4|dns6|dns)\/(.*?)\/tcp\/[0-9]{0,5}\/(ws|wss|tls\/ws)\/p2p\/[a-zA-Z1-9^Il0O]+/i

    const webrtc =
      /\/(ip4|ip6)\/(.*?)\/udp\/(.*?)\/webrtc\/certhash\/(.*?)\/p2p\/[a-zA-Z1-9^Il0O]+/i

    if (!ws.test(addr) && !webrtc.test(addr))
      throw new Error("Provided multiaddress is not correct.")
  }

  const alterBootnodes = async (
    bootnode: string,
    add: boolean,
    defaultBootnode: boolean,
  ) => {
    // if bootnode belongs to the list (default) then it does not need to be validated as it
    // comes from the chainspecs. It can be saved to the local storage at once.
    try {
      if (!defaultBootnode) {
        // verify bootnode validity
        checkMultiAddr(customBnInput)
      }
      // Check if bootnode already exists in the default and custom lists
      if (
        selectedChainDefaultBn?.includes(customBnInput) ||
        customBn.map((c) => c.bootnode).includes(customBnInput)
      ) {
        setAddMessage({
          error: true,
          message: "Bootnode already exists in the list.",
        })
      } else {
        await saveToLocalStorage(
          selectedChain,
          bootnode,
          add,
          selectedChainDefaultBn,
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
      setCustomBnInput("")
    } catch (err) {
      setAddMessage({
        error: true,
        message: (err as Error).message.replace(/^\w/, (c) => c.toUpperCase()),
      })
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
          {selectedChainDefaultBn?.map((bn) => (
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
              <div className="text-ellipsis overflow-hidden whitespace-nowrap w-11/12">
                {c.bootnode}
              </div>
              <button
                className="flex bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-full items-center"
                onClick={async () => {
                  await saveToLocalStorage(
                    selectedChain,
                    c.bootnode,
                    false,
                    selectedChainDefaultBn,
                  )
                  setCustomBn(customBn.filter((f) => f.bootnode !== c.bootnode))
                }}
              >
                <MdDeleteOutline className="text-base" />
                <p>Remove</p>
              </button>
            </div>
          ))}
        </div>
        <Title>Add custom Bootnode</Title>
        <div className="flex flex-col">
          <div className="flex flex-row mb-4 justify-between">
            <input
              type="text"
              className="w-10/12 block px-2 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding
              border border-solid border-gray-300 rounded focus:text-gray-700 focus:bg-white focus:border-[#24cc85]
              focus:outline-none"
              placeholder="Enter bootnode address"
              value={customBnInput}
              onChange={(v) => {
                addMessage && setAddMessage(undefined)
                setCustomBnInput(v.target.value)
              }}
            />
            <div className="w-2/12">
              <button
                className="py-1.5 text-sm px-8 border border-[#24cc85] rounded text-[#24cc85] hover:text-white
                  hover:bg-[#24cc85] capitalize ml-4 disabled:border-gray-200 disabled:text-white disabled:bg-gray-200"
                disabled={!customBnInput}
                onClick={() => {
                  if (
                    selectedChainDefaultBn?.includes(customBnInput) ||
                    customBn.map((c) => c.bootnode).includes(customBnInput)
                  ) {
                    setAddMessage({
                      error: true,
                      message: "Bootnode already exists in the list.",
                    })
                  } else {
                    alterBootnodes(
                      customBnInput,
                      true,
                      selectedChainDefaultBn?.includes(customBnInput),
                    )
                  }
                }}
              >
                Add
              </button>
            </div>
          </div>
          <p className={bootnodeMsgClass}>
            {addMessage && Object.keys(addMessage) ? addMessage.message : ""}
          </p>
        </div>
      </div>
    </section>
  )
}
