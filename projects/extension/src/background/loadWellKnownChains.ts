import * as environment from "../environment"

// Loads the well-known chains bootnodes from the local storage and returns the well-known
// chains.
export const loadWellKnownChains = async (): Promise<Map<string, string>> =>
  // Note that this list doesn't necessarily always have to match the list of well-known
  // chains in `@substrate/connect`. The list of well-known chains is not part of the stability
  // guarantees of the connect <-> extension protocol and is thus allowed to change
  // between versions of the extension. For this reason, we don't use the `WellKnownChain`
  // enum from `@substrate/connect` but instead manually make the list in that enum match
  // the list present here.
  new Map(
    await Promise.all(
      [
        "./chainspecs/polkadot.json",
        "./chainspecs/ksmcc3.json",
        "./chainspecs/westend2.json",
        "./chainspecs/rococo_v2_2.json",
      ].map(async (path: string) => {
        const chainSpec = (await (
          await fetch(chrome.runtime.getURL(`${path}`))
        ).json()) as unknown as { id: string; bootNodes: string[] }
        const bootNodes = await environment.get({
          type: "bootnodes",
          chainName: chainSpec.id,
        })
        if (bootNodes) {
          chainSpec.bootNodes = bootNodes
        }
        return [chainSpec.id, JSON.stringify(chainSpec)] as [string, string]
      }),
    ),
  )
