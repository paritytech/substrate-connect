import { FC } from "react"
import { type LightClientProvider } from "@substrate/light-client-extension-helpers/web-page"
import westmint from "../chainspecs/westend-westmint.json?raw"
import { useChains } from "../hooks/useChains"
import { Chain } from "../components/Chain"

const westendGenesisHash =
  "0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e"

const westmintGenesisHash =
  "0x67f9723393ef76214df0118c34bbbd3dbebc8ed46a10973a8c969d48fe7598c9"

type Props = {
  provider: LightClientProvider
}

export const Chains: FC<Props> = ({ provider }) => {
  const { chains } = useChains(provider)

  const showActions = chains[westendGenesisHash] && !chains[westmintGenesisHash]

  const handleAddChainWestmint = async () => {
    try {
      const chain = await provider.getChain(westmint, westendGenesisHash)
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
          <div>
            <button onClick={handleAddChainWestmint}>Add Westmint Chain</button>
          </div>
        </>
      )}
    </main>
  )
}
