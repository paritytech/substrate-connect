import { useUnstableProvider } from "../hooks"
import * as select from "@zag-js/select"
import { useMachine, normalizeProps } from "@zag-js/react"
import { useEffect, useId } from "react"
import {
  polkadot,
  ksmcc3,
  westend2,
  polkadot_asset_hub,
  westend2_asset_hub,
  ksmcc3_asset_hub,
} from "@substrate/connect-known-chains"
import { useChains } from "../hooks/useChains"
import { useToast } from "./Toast"

const chainData = [
  {
    label: "Polkadot",
    value: "0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3",
    chainSpec: polkadot,
  },
  {
    label: "Kusama",
    value: "0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe",
    chainSpec: ksmcc3,
  },
  {
    label: "Westend",
    value: "0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e",
    chainSpec: westend2,
  },
  {
    label: "Polkadot Asset Hub",
    value: "0x68d56f15f85d3136970ec16946040bc1752654e906147f7e43e9d539d7c3de2f",
    chainSpec: polkadot_asset_hub,
    relayChainGenesisHash:
      "0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3",
  },
]

export const ChainSelect = () => {
  const { chainId, setChainId, provider } = useUnstableProvider()
  const { chains: connectedChains } = useChains(provider)
  const toast = useToast()

  const isConnected = !!Object.keys(connectedChains).find(
    (connectedChainId) => connectedChainId === chainId,
  )

  const onAddChainSpec = async () => {
    const chain = chainData.find((chain) => chain.value === chainId)!
    // TODO: error handling
    try {
      const getChain = await provider?.getChain(
        chain.chainSpec,
        chain.relayChainGenesisHash,
      )
      toast.success({
        title: "Chainspec added successfully",
        placement: "bottom-end",
      })
    } catch (err) {
      toast.error({
        title: "Failed to add chainspec",
        description: err instanceof Error ? err.message : undefined,
        placement: "bottom-end",
      })
    }
  }

  const chains = select.collection({
    items: chainData,
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
  })

  const [state, send] = useMachine(
    select.machine({
      id: useId(),
      collection: chains,
      value: [chainId],
      onValueChange: (chainId) => setChainId(chainId.value[0]),
    }),
  )

  const api = select.connect(state, send, normalizeProps)

  return (
    <article>
      <header>
        <div style={{ display: "flex" }}>
          <label
            htmlFor="relaychain-dropdown"
            style={{
              alignContent: "center",
              flexGrow: 10,
              fontWeight: "bold",
            }}
          >
            Network:
          </label>
          <div
            style={{
              flexGrow: 1,
            }}
          >
            <select
              id="relaychain-dropdown"
              onChange={(e) =>
                api.selectValue(chainData[e.target.selectedIndex].value)
              }
              style={{
                cursor: "pointer",
              }}
              defaultValue={api.value[0]}
            >
              {chainData.map(({ label, value }, index) => (
                <option key={index} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>
      <div style={{ display: "flex" }}>
        <div
          style={{
            flexGrow: 10,
          }}
        >
          <span
            style={{
              fontWeight: "bold",
            }}
          >
            Status:
          </span>{" "}
          <span
            style={{
              padding: "5px 10px",
              backgroundColor: isConnected ? "#4CAF50" : "#f44336",
              color: "white",
              borderRadius: "4px",
            }}
          >
            {isConnected ? "Connected" : "Not Connected"}
          </span>
        </div>
        {provider && !isConnected && (
          <div style={{ flexGrow: 1 }}>
            <button type="button" onClick={onAddChainSpec}>
              Add ChainSpec
            </button>
          </div>
        )}
      </div>
    </article>
  )
}
