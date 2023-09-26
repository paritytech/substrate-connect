import { WellKnownChain } from "../../WellKnownChain.js"

let chains: Record<WellKnownChain, Promise<{ chainSpec: string }>> | undefined

export async function getSpec(chain: string): Promise<string> {
  if (!Object.keys(WellKnownChain).includes(chain))
    throw new Error("Invalid chain name")
  if (!chains) {
    chains = {
      // Dynamic imports needs to be explicit for ParcelJS
      // See https://github.com/parcel-bundler/parcel/issues/125
      polkadot: import("./js/polkadot.js"),
      ksmcc3: import("./js/ksmcc3.js"),
      westend2: import("./js/westend2.js"),
      rococo_v2_2: import("./js/rococo_v2_2.js"),
    }
  }
  return (await chains[chain as WellKnownChain]).chainSpec
}
