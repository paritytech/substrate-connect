import {
  Clipboard,
  ClipboardCheck,
  ClipboardCopyIcon,
  Trash,
} from "lucide-react"
import * as clipboard from "@zag-js/clipboard"
import { useMachine, normalizeProps } from "@zag-js/react"
import { useId } from "react"
import useSWR from "swr"

import { rpc } from "../../api"
import { ChainSpec } from "../../../../background/types"

type ChainSpecListItemProps = {
  chainSpec: ChainSpec
}

const ChainSpecListItem = ({ chainSpec }: ChainSpecListItemProps) => {
  const [state, send] = useMachine(
    clipboard.machine({
      id: useId(),
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
          <Trash className="stroke-current text-red-600" />
        )}
      </div>
    </section>
  )
}

export const ListChainSpecs = () => {
  const { data: chainSpecs } = useSWR(
    "rpc.getChainSpecs",
    () => rpc.client.getChainSpecs(),
    { revalidateOnFocus: true },
  )

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
                <ChainSpecListItem chainSpec={chainSpec} />
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
                  <ChainSpecListItem chainSpec={chainSpec} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </section>
  )
}
