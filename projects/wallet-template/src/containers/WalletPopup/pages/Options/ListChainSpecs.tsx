import { ClipboardCheck, ClipboardCopyIcon, Trash } from "lucide-react"
import * as clipboard from "@zag-js/clipboard"
import { useMachine, normalizeProps } from "@zag-js/react"
import useSWR from "swr"

import { rpc } from "../../api"
import { ChainSpec } from "../../../../background/types"

type ChainSpecListItemProps = {
  chainSpec: ChainSpec
  onDeleteChainSpec: (chainSpec: ChainSpec) => unknown
}

const ChainSpecListItem = ({
  chainSpec,
  onDeleteChainSpec,
}: ChainSpecListItemProps) => {
  const [state, send] = useMachine(
    clipboard.machine({
      id: chainSpec.id,
      value: chainSpec.raw,
    }),
  )

  const api = clipboard.connect(state, send, normalizeProps)

  return (
    <section {...api.rootProps} className="flex items-start justify-between">
      <h3 className="font-semibold text-lg">{chainSpec.name}</h3>
      <div className="flex items-center">
        <button
          {...api.triggerProps}
          type="button"
          className={`${api.isCopied ? "bg-green-200" : ""}`}
        >
          {api.isCopied ? (
            <ClipboardCheck className="stroke-current" />
          ) : (
            <ClipboardCopyIcon className="stroke-current" />
          )}
        </button>
        {!chainSpec.isWellKnown && (
          <button onClick={() => onDeleteChainSpec(chainSpec)}>
            <Trash className="stroke-current text-red-600" />
          </button>
        )}
      </div>
    </section>
  )
}

export const ListChainSpecs = () => {
  const { data: chainSpecs, mutate } = useSWR(
    "rpc.getChainSpecs",
    () => rpc.client.getChainSpecs(),
    { revalidateOnFocus: true },
  )

  const onDeleteChainSpec = async (chainSpec: ChainSpec) => {
    // TODO: error handling
    await rpc.client.removeChainSpec(chainSpec.genesisHash)
    await mutate()
    console.log(`chain spec ${chainSpec.id} removed`)
  }

  const relayChains = chainSpecs?.filter((chainSpec) => !chainSpec.relay_chain)
  const parachains = chainSpecs?.filter((chainSpec) => !!chainSpec.relay_chain)

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <section aria-labelledby="relaychains-heading">
          <h2 id="relaychains-heading" className="text-xl font-semibold mb-4">
            Relay Chains
          </h2>
          <ul className="space-y-4">
            {relayChains?.map((chainSpec) => (
              <li className="bg-white p-4 shadow rounded-lg">
                <ChainSpecListItem
                  chainSpec={chainSpec}
                  onDeleteChainSpec={onDeleteChainSpec}
                />
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="parachains-heading" className="mt-10">
          <h2 id="parachains-heading" className="text-xl font-semibold mb-4">
            Parachains
          </h2>
          <div className="ax-h-72 overflow-auto">
            <ul className="space-y-4">
              {parachains?.map((chainSpec) => (
                <li className="bg-white p-4 shadow rounded-lg">
                  <ChainSpecListItem
                    chainSpec={chainSpec}
                    onDeleteChainSpec={onDeleteChainSpec}
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </section>
  )
}
