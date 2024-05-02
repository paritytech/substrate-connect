import { Clipboard, ArrowRightCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import ReactJson from "react-json-view"
import { z } from "zod"
import { rpc } from "../api"
import { Layout } from "../../../components/Layout"

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

const maxLength = 32
const ellipsisText = (text: string) =>
  text.length > maxLength
    ? `${text.substring(0, maxLength / 2)}...${text.substring(text.length - maxLength / 2, text.length)}`
    : text

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

  const onAllowlistChainSpec = async () => {
    if (!inputChain) {
      return
    }

    await rpc.client.addChainSpec(inputChain.chainSpec)
    window.close()
  }

  return (
    <Layout>
      <div className="p-4 bg-gray-100 bg-gradient-to-r from-blue-500 to-purple-600">
        <h1 className="text-xl font-bold text-white">
          Review Chain Specification
        </h1>
        {inputChain && (
          <>
            <section aria-labelledby="chain-spec-name-heading" className="mt-4">
              <h2
                id="chain-spec-name-heading"
                className="text-lg font-semibold text-yellow-300"
              >
                {inputChain.name}
              </h2>
              <div className="flex justify-between items-center mt-2">
                <div>
                  <label className="block font-medium text-white">
                    Genesis Hash:
                  </label>
                  <p className="text-sm text-gray-300">
                    {ellipsisText(inputChain.genesisHash)}
                  </p>
                </div>
                <button className="p-2">
                  {/* TODO: Implement Copy */}
                  <Clipboard className="text-white" size={16} />
                </button>
              </div>
              {inputChain.relayChainGenesisHash && (
                <div className="flex justify-between items-center mt-2">
                  <div>
                    <label className="block font-medium text-white">
                      Relay Chain Genesis Hash:
                    </label>
                    <p className="text-sm text-gray-300">
                      {ellipsisText(inputChain.relayChainGenesisHash)}
                    </p>
                  </div>
                  <button className="p-2">
                    {/* TODO: Implement Copy */}
                    <Clipboard className="text-white" size={16} />
                  </button>
                </div>
              )}
            </section>

            <section className="mt-4">
              <h2
                id="chain-spec-name-heading"
                className="text-lg font-semibold text-yellow-300"
              >
                Raw Chain Spec
              </h2>
              <div className="mt-2">
                <ReactJson
                  src={JSON.parse(inputChain.chainSpec)}
                  theme="solarized"
                  displayDataTypes={false}
                  collapsed={1}
                  collapseStringsAfterLength={15}
                />
              </div>
            </section>

            <section
              aria-labelledby="confirmation-action-heading"
              className="mt-6"
            >
              <h2
                id="confirmation-action-heading"
                className="text-lg font-semibold text-white"
              >
                Action
              </h2>
              <div className="flex space-x-4 mt-2">
                <button
                  className="flex items-center space-x-2 bg-blue-200 p-2 rounded hover:bg-blue-300"
                  onClick={onAllowlistChainSpec}
                >
                  <ArrowRightCircle
                    className="text-blue-700"
                    aria-hidden="true"
                  />
                  <span>Allowlist ChainSpec</span>
                </button>
              </div>
            </section>
          </>
        )}
      </div>
    </Layout>
  )
}
