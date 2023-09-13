import westend2 from "../chainspecs/westend2.json"
import ksmcc3 from "../chainspecs/ksmcc3.json"
import polkadot from "../chainspecs/polkadot.json"
import rococo_v2_2 from "../chainspecs/rococo_v2_2.json"

import * as environment from "../environment"

// Loads the well-known chains bootnodes from the local storage and returns the well-known
// chains.
export const loadWellKnownChains = async (): Promise<Map<string, string>> => {
  let polkadot_cp = Object.assign({}, polkadot)
  let ksmcc3_cp = Object.assign({}, ksmcc3)
  let westend2_cp = Object.assign({}, westend2)
  let rococo_cp = Object.assign({}, rococo_v2_2)

  const polkadotBootnodes = await environment.get({
    type: "bootnodes",
    chainName: polkadot_cp.id,
  })
  if (polkadotBootnodes) {
    polkadot_cp.bootNodes = polkadotBootnodes
  }

  const ksmcc3Bootnodes = await environment.get({
    type: "bootnodes",
    chainName: ksmcc3_cp.id,
  })
  if (ksmcc3Bootnodes) {
    ksmcc3_cp.bootNodes = ksmcc3Bootnodes
  }

  const westend2Bootnodes = await environment.get({
    type: "bootnodes",
    chainName: westend2_cp.id,
  })
  if (westend2Bootnodes) {
    westend2_cp.bootNodes = westend2Bootnodes
  }

  const rococoBootnodes = await environment.get({
    type: "bootnodes",
    chainName: rococo_cp.id,
  })
  if (rococoBootnodes) {
    rococo_cp.bootNodes = rococoBootnodes
  }

  // Note that this list doesn't necessarily always have to match the list of well-known
  // chains in `@substrate/connect`. The list of well-known chains is not part of the stability
  // guarantees of the connect <-> extension protocol and is thus allowed to change
  // between versions of the extension. For this reason, we don't use the `WellKnownChain`
  // enum from `@substrate/connect` but instead manually make the list in that enum match
  // the list present here.
  return new Map<string, string>([
    [polkadot_cp.id, JSON.stringify(polkadot_cp)],
    [ksmcc3_cp.id, JSON.stringify(ksmcc3_cp)],
    [rococo_cp.id, JSON.stringify(rococo_cp)],
    [westend2_cp.id, JSON.stringify(westend2_cp)],
  ])
}
