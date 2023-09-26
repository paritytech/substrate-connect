import { WellKnownChain } from "../../WellKnownChain.js"

export async function getSpec(chain: string): Promise<string> {
  if (!Object.keys(WellKnownChain).includes(chain))
    throw new Error("Invalid chain name")
  return (await import(`./js/${chain}.js`)).chainSpec
}
