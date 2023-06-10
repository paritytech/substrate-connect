import { WellKnownChain } from "src/WellKnownChain"
import ksmcc3 from "./js/ksmcc3.js"
import polkadot from "./js/polkadot.js"
import rococo_v2_2 from "./js/rococo_v2_2.js"
import westend2 from "./js/westend2.js"

const chains: Record<WellKnownChain, string> = {
  ksmcc3,
  polkadot,
  rococo_v2_2,
  westend2,
}

export function getSpec(chain: string): string {
  if (!Object.keys(chains).includes(chain))
    throw new Error("Invalid chain name")
  return chains[chain as WellKnownChain]
}
