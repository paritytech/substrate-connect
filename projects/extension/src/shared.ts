import { WellKnownChainMap } from "./types"

const PORT_PREFIX = "substrate-connect-port"

export const PORTS = {
  POPUP: `${PORT_PREFIX}-popup`,
  OPTIONS: `${PORT_PREFIX}-options`,
  CONTENT: `${PORT_PREFIX}-content`,
}

export const wellKnownChainMap: WellKnownChainMap = {
  westend2: "Westend",
  polkadot: "Polkadot",
  ksmcc3: "Kusama",
  rococo_v2_2: "Rococo",
}
