import { FC } from "react"
import { type LightClientProvider } from "@substrate/light-client-extension-helpers/web-page"
import westmint from "../chainspecs/westend-westmint.json?raw"
import {
  polkadot_asset_hub,
  polkadot_bridge_hub,
  polkadot_collectives,
  ksmcc3_asset_hub,
  ksmcc3_bridge_hub,
  westend2_asset_hub,
  westend2_bridge_hub,
  westend2_collectives,
} from "@substrate/connect-known-chains"
import { useChains } from "../hooks/useChains"
import { Chain } from "../components/Chain"

const genesisHashes: Record<string, string> = {
  polkadot:
    "0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3",
  westend: "0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e",
  kusama: "0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe",
  rococo: "0x6408de7737c59c238890533af25896a2c20608d8b380bb01029acb392781063e",
  Westmint:
    "0x67f9723393ef76214df0118c34bbbd3dbebc8ed46a10973a8c969d48fe7598c9",
  "Polkadot Asset Hub":
    "0x68d56f15f85d3136970ec16946040bc1752654e906147f7e43e9d539d7c3de2f",
  "Polkadot Collectives":
    "0x46ee89aa2eedd13e988962630ec9fb7565964cf5023bb351f2b6b25c1b68b0b2",
  "Polkadot Bridge Hub":
    "0xdcf691b5a3fbe24adc99ddc959c0561b973e329b1aef4c4b22e7bb2ddecb4464",
  "Kusama Asset Hub":
    "0x48239ef607d7928874027a43a67689209727dfb3d3dc5e5b03a39bdc2eda771a",
  "Kusama Bridge Hub":
    "0x00dcb981df86429de8bbacf9803401f09485366c44efbf53af9ecfab03adc7e5",
  "Westend Asset Hub":
    "0x67f9723393ef76214df0118c34bbbd3dbebc8ed46a10973a8c969d48fe7598c9",
  "Westend Bridge Hub":
    "0x0441383e31d1266a92b4cb2ddd4c2e3661ac476996db7e5844c52433b81fe782",
  "Westend Collectives":
    "0x713daf193a6301583ff467be736da27ef0a72711b248927ba413f573d2b38e44",
}

const parachains: [string, string, string][] = [
  ["Polkadot Asset Hub", polkadot_asset_hub, genesisHashes["polkadot"]],
  ["Polkadot Bridge Hub", polkadot_bridge_hub, genesisHashes["polkadot"]],
  ["Polkadot Collectives", polkadot_collectives, genesisHashes["polkadot"]],
  ["Kusama Asset Hub", ksmcc3_asset_hub, genesisHashes["kusama"]],
  ["Kusama Bridge Hub", ksmcc3_bridge_hub, genesisHashes["kusama"]],
  ["Westend Asset Hub", westend2_asset_hub, genesisHashes["westend"]],
  ["Westend Bridge Hub", westend2_bridge_hub, genesisHashes["westend"]],
  ["Westend Collectives", westend2_collectives, genesisHashes["westend"]],
  ["Westmint", westmint, genesisHashes["westend"]],
]

type Props = {
  provider: LightClientProvider
}

export const Chains: FC<Props> = ({ provider }) => {
  const { chains } = useChains(provider)

  const handleAddChain = async (
    chainSpec: string,
    relayChainGenesisHash: string,
  ) => {
    try {
      const chain = await provider.getChain(chainSpec, relayChainGenesisHash)
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
      {
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
              if (chains[genesisHashes[name]]) {
                return null
              }
              return (
                <button
                  onClick={() =>
                    handleAddChain(chainSpec, relayChainGenesisHash)
                  }
                >
                  Add {name} Chain
                </button>
              )
            })}
          </div>
        </>
      }
    </main>
  )
}
