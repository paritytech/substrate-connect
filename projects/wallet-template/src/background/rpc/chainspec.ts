import { RpcMethodHandlers } from "@substrate/light-client-extension-helpers/utils"
import { z } from "zod"

import { BackgroundRpcSpec } from "../types"
import {
  wellKnownChainIdByGenesisHash,
  wellKnownGenesisHashByChainId,
} from "../../constants"
import { Context } from "./types"

const chainSpecSchema = z.object({
  name: z.string(),
  id: z.string(),
  relay_chain: z.string().optional(),
})

export const listChainSpecsHandler: RpcMethodHandlers<
  BackgroundRpcSpec,
  Context
>["getChainSpecs"] = async (_, { lightClientPageHelper }) => {
  const chains = await lightClientPageHelper.getChains()
  const chainSpecs = chains.map((chain) => {
    const parsed = chainSpecSchema.parse(JSON.parse(chain.chainSpec))

    return {
      ...parsed,
      genesisHash: chain.genesisHash,
      isWellKnown: !!wellKnownGenesisHashByChainId[parsed.id],
      raw: chain.chainSpec,
    }
  })

  return chainSpecs
}

export const addChainSpecHandler: RpcMethodHandlers<
  BackgroundRpcSpec,
  Context
>["addChainSpec"] = async ([chainSpec], { lightClientPageHelper }) => {
  const chainSpecParsed = chainSpecSchema.parse(JSON.parse(chainSpec))

  const relayChainChainSpec = await lightClientPageHelper
    .getChains()
    .then((chains) =>
      chains.map((chain) => ({
        ...chainSpecSchema.parse(JSON.parse(chain.chainSpec)),
        genesisHash: chain.genesisHash,
      })),
    )
    .then((chains) =>
      chains.find((chain) => chain.id === chainSpecParsed.relay_chain),
    )

  if (chainSpecParsed.relay_chain && !relayChainChainSpec) {
    throw new Error("relay chain not found")
  }
  if (relayChainChainSpec?.relay_chain) {
    throw new Error("relay chain cannot be a parachain")
  }

  await lightClientPageHelper.persistChain(
    chainSpec,
    relayChainChainSpec?.genesisHash,
  )
}

export const removeChainSpecHandler: RpcMethodHandlers<
  BackgroundRpcSpec,
  Context
>["removeChainSpec"] = async ([genesisHash], { lightClientPageHelper }) => {
  if (genesisHash && wellKnownChainIdByGenesisHash[genesisHash]) {
    throw new Error("cannot remove well-known chain")
  }

  const chains = await lightClientPageHelper.getChains()
  const parachains = chains
    .filter((chain) => chain.relayChainGenesisHash === genesisHash)
    .map((chain) => chain.genesisHash)

  await Promise.all(
    [...parachains, genesisHash].map((hash) =>
      lightClientPageHelper.deleteChain(hash),
    ),
  )
}
