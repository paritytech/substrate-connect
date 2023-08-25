const PORT_PREFIX = "substrate-connect-port"

export const PORTS = {
  POPUP: `${PORT_PREFIX}-popup`,
  OPTIONS: `${PORT_PREFIX}-options`,
  CONTENT: `${PORT_PREFIX}-content`,
}

export const isManifestV3 = chrome.runtime.getManifest().manifest_version === 3
