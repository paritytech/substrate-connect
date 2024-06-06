import { Clipboard, Check, X } from "lucide-react"
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import ReactJson from "react-json-view"
import { z } from "zod"
import { rpc } from "../api"
import { Layout2 } from "@/components/Layout2"
import { Header } from "../components"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface InputChain {
  genesisHash: string
  name: string
  chainSpec: string
  relayChainGenesisHash?: string
}

const schema = z.object({
  genesisHash: z.string(),
  name: z.string(),
  chainSpec: z.string(),
  relayChainGenesisHash: z.string().optional(),
})

export const AddChainByUser: React.FC = () => {
  const [searchParams, _] = useSearchParams()
  const params = searchParams.get("params")

  const [inputChain, setInputChain] = useState<InputChain>()

  useEffect(() => {
    if (!params) {
      return
    }

    const result = schema.safeParse(JSON.parse(params))
    if (result.success) {
      setInputChain(result.data)
    }
  }, [params])

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    const half = Math.floor((maxLength - 3) / 2)
    return `${text.slice(0, half)}...${text.slice(-half)}`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const onAllowlistChainSpec = async () => {
    if (!inputChain) {
      return
    }

    await rpc.client.addChainSpec(inputChain.chainSpec)
    window.close()
  }

  return (
    <Layout2>
      <Header />

      <div className="flex items-center justify-between px-6 mt-4 mb-4 sm:px-8">
        <h2 className="text-xl font-semibold">Review Chain Specification</h2>
      </div>

      <ScrollArea className="px-6 mb-4 grow sm:px-8">
        <main className="space-y-4">
          {inputChain && (
            <>
              <section aria-labelledby="chain-name">
                <h2
                  id="chain-name"
                  className="text-xl font-semibold text-foreground"
                >
                  Chain Name
                </h2>
                <p className="mt-1 text-lg text-muted-foreground">
                  {inputChain.name}
                </p>
              </section>

              <section aria-labelledby="genesis-hash">
                <h2
                  id="genesis-hash"
                  className="text-xl font-semibold text-foreground"
                >
                  Genesis Hash
                </h2>
                <div className="flex items-center mt-1 space-x-2">
                  <p className="p-2 font-mono text-xs break-all rounded grow bg-muted text-muted-foreground">
                    {truncateText(inputChain.genesisHash, 40)}
                  </p>
                  <Button
                    variant="secondary"
                    className="flex items-center transition-transform duration-300 hover:scale-105"
                    onClick={() => copyToClipboard(inputChain.genesisHash)}
                  >
                    <Clipboard className="w-4 h-4" />
                  </Button>
                </div>
              </section>

              {inputChain.relayChainGenesisHash && (
                <section aria-labelledby="relay-chain-genesis-hash">
                  <h2
                    id="relay-chain-genesis-hash"
                    className="text-xl font-semibold text-foreground"
                  >
                    Relay Chain Genesis Hash
                  </h2>
                  <div className="flex items-center mt-1 space-x-2">
                    <p className="p-2 font-mono text-xs break-all rounded grow bg-muted text-muted-foreground">
                      {truncateText(inputChain.relayChainGenesisHash, 40)}
                    </p>
                    <Button
                      variant="secondary"
                      className="flex items-center transition-transform duration-300 hover:scale-105"
                      onClick={() =>
                        copyToClipboard(inputChain.relayChainGenesisHash!)
                      }
                    >
                      <Clipboard className="w-4 h-4" />
                    </Button>
                  </div>
                </section>
              )}

              <section aria-labelledby="chainspec-json">
                <h2
                  id="chainspec-json"
                  className="text-xl font-semibold text-foreground"
                >
                  Chain Specification JSON
                </h2>
                <div className="mt-1 overflow-auto rounded bg-muted">
                  <ReactJson
                    src={JSON.parse(inputChain.chainSpec)}
                    displayDataTypes={false}
                    collapsed={1}
                    collapseStringsAfterLength={32}
                  />
                </div>
              </section>
            </>
          )}
        </main>
      </ScrollArea>

      <footer className="flex justify-center p-4 space-x-4">
        <Button
          className="flex items-center space-x-2 font-semibold transition-transform duration-300 rounded bg-emerald-600 text-background hover:bg-emerald-700 hover:scale-105"
          onClick={onAllowlistChainSpec}
        >
          <Check className="w-4 h-4" />
          <span>Allowlist ChainSpec</span>
        </Button>
        <Button
          className="flex items-center space-x-2 font-semibold transition-transform duration-300 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200 hover:scale-105"
          onClick={() => window.close()}
        >
          <X className="w-4 h-4" />
          <span>Cancel</span>
        </Button>
      </footer>
    </Layout2>
  )
}
