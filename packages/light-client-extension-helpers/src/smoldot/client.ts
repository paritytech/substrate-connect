import * as smoldot from "smoldot"
import { AddChainOptions, Client, ClientOptions } from "./types"

/**
 * Wraps a smoldot client to add restart functionality.
 *
 * The key difference from the standard smoldot client is how relay chains are
 * specified. Instead of using `Chain` objects for `potentialRelayChains`,
 * we use `AddChainOptions`. This is necessary because the `Chain` objects
 * become invalid after a restart and can't be used in a replay `addChain` call.
 *
 * With `AddChainOptions`, we can easily re-add a parachain after a restart by
 * reusing the same options for each relay chain. Before adding the parachain,
 * we add the relay chains using their `AddChainOptions` and then remove them
 * after the parachain is created.
 *
 * This ensures the parachain can always be added successfully, as its relay
 * chain is always added first.
 */
export const start = (options?: ClientOptions): Client => {
  let client = smoldot.start(options)
  let terminated = false

  const addChain = async (options: AddChainOptions) => {
    const potentialRelayChains = await Promise.all(
      options.potentialRelayChains?.map((options) =>
        client.addChain(options),
      ) ?? [],
    )

    const newChain = await client.addChain({
      ...options,
      potentialRelayChains,
    })

    await Promise.all(potentialRelayChains.map((chain) => chain.remove()))

    return newChain
  }

  const terminate = () => {
    terminated = true
    return client.terminate()
  }

  const restart = async () => {
    if (terminated) {
      throw new Error("Cannot restart a terminated client")
    }

    try {
      await client.terminate()
    } catch {}
    client = smoldot.start(options)
  }

  return {
    addChain,
    restart,
    terminate,
  }
}
