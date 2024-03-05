import { FC, useState } from "react"
import { type LightClientProvider } from "@substrate/light-client-extension-helpers/web-page"
import westmint from "../chainspecs/westend-westmint.json?raw"
import {
  polkadot_asset_hub,
  polkadot_bridge_hub,
  polkadot_collectives,
  ksmcc3_asset_hub,
  ksmcc3_bridge_hub,
  rococo_v2_2_asset_hub,
  rococo_v2_2_bridge_hub,
  westend2_asset_hub,
  westend2_bridge_hub,
  westend2_collectives,
} from "@substrate/connect-known-chains"
import { useChains } from "../hooks/useChains"
import { Chain } from "../components/Chain"

const westendGenesisHash =
  "0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e"

const westmintGenesisHash =
  "0x67f9723393ef76214df0118c34bbbd3dbebc8ed46a10973a8c969d48fe7598c9"

const polkadotGenesisHash =
  "0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3"

const ksmGenesisHash =
  "0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe"

const rococoGenesisHash =
  "0x6408de7737c59c238890533af25896a2c20608d8b380bb01029acb392781063e"

const parachains: [string, string, string][] = [
  ["Polkadot Asset Hub", polkadot_asset_hub, polkadotGenesisHash],
  ["Polkadot Bridge Hub", polkadot_bridge_hub, polkadotGenesisHash],
  ["Polkadot Collectives", polkadot_collectives, polkadotGenesisHash],
  ["Kusama Asset Hub", ksmcc3_asset_hub, ksmGenesisHash],
  ["Kusama Bridge Hub", ksmcc3_bridge_hub, ksmGenesisHash],
  ["Rococo Asset Hub", rococo_v2_2_asset_hub, rococoGenesisHash],
  ["Rococo Bridge Hub", rococo_v2_2_bridge_hub, rococoGenesisHash],
  ["Westmint", westmint, westendGenesisHash],
  ["Westend Asset Hub", westend2_asset_hub, westendGenesisHash],
  ["Westend Bridge Hub", westend2_bridge_hub, westendGenesisHash],
  ["Westend Collectives", westend2_collectives, westendGenesisHash],
]

type Props = {
  provider: LightClientProvider
}

export const Chains: FC<Props> = ({ provider }) => {
  const { chains } = useChains(provider)

  const showActions = chains[westendGenesisHash] && !chains[westmintGenesisHash]

  const [addedParachains, setAddedParachains] = useState<
    Record<string, string>
  >({})

  const handleAddChain = async (
    name: string,
    chainSpec: string,
    relayChainGenesisHash: string,
  ) => {
    try {
      const chain = await provider.getChain(chainSpec, relayChainGenesisHash)
      setAddedParachains({
        ...addedParachains,
        [name]: chain.genesisHash,
      })
      console.log("provider.addChain()", chain)
    } catch (error) {
      console.error("provider.addChain()", error)
    }
  }

  return (
    <main className="container">
      <h1>Extension Test DApp</h1>
      <h2>Chains</h2>
      {Object.values(chains).map((chain) => (
        <Chain key={chain.genesisHash} chain={chain} />
      ))}
      {showActions && (
        <>
          <h2>Actions</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "1rem",
            }}
          >
            {parachains.map(([name, chainSpec, relayChainGenesisHash]) => {
              if (addedParachains[name]) {
                return null
              }
              return (
                <button
                  onClick={() =>
                    handleAddChain(name, chainSpec, relayChainGenesisHash)
                  }
                >
                  Add {name} Chain
                </button>
              )
            })}
          </div>
        </>
      )}
    </main>
  )
}
