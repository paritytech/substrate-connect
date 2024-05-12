import * as smoldot from "smoldot"
import { AddChainOptions, Client, ClientOptions } from "./types"

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
