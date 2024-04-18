import { RpcMethodHandlers } from "@substrate/light-client-extension-helpers/utils"
import { Context } from "./types"
import { BackgroundRpcSpec } from "../types"
import { z } from "zod"

const chainSpecSchema = z.object({
  id: z.string(),
  relay_chain: z.string().optional(),
})

export const addChainSpecHandler: RpcMethodHandlers<
  BackgroundRpcSpec,
  Context
>["addChainSpec"] = async ([chainSpec], { lightClientPageHelper }) => {
  const chainSpecParsed = chainSpecSchema.parse(JSON.parse(chainSpec))
  const { relay_chain: relayChainId } = chainSpecParsed

  const relayChain = await lightClientPageHelper
    .getChains()
    .then((chains) =>
      chains.map((chain) => ({
        ...chainSpecSchema.parse(JSON.parse(chain.chainSpec)),
        genesisHash: chain.genesisHash,
      })),
    )
    .then((chains) => chains.find((chain) => chain.id === relayChainId))

  if (relayChain?.relay_chain) {
    throw new Error("relay chain cannot be a parachain")
  }

  await lightClientPageHelper.persistChain(chainSpec, relayChain?.genesisHash)
}
