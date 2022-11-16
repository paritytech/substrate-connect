import westend2 from "../public/assets/westend2.json"
import ksmcc3 from "../public/assets/ksmcc3.json"
import polkadot from "../public/assets/polkadot.json"
import rococo_v2_2 from "../public/assets/rococo_v2_2.json"

export type StorageEntry =
  | { type: "braveSetting" }
  | { type: "database"; chainName: string }
  | { type: "bootnodes"; chainName: string }
  | { type: "activeChains"; tabId: number }

export type StorageEntryType<E extends StorageEntry> =
  E["type"] extends "braveSetting"
    ? boolean
    : E["type"] extends "database"
    ? string
    : E["type"] extends "bootnodes"
    ? string[]
    : E["type"] extends "activeChains"
    ? ExposedChainConnection[]
    : never

/**
 * Finds all the `activeChains` entries, and concatenates them together.
 *
 * Important note: the reason why each tab has its own local storage entry is to avoid race
 * conditions where tabs send messages at the same time and overwrite each other's list of chains.
 */
export async function getAllActiveChains(): Promise<ExposedChainConnection[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get(null, (res) => {
      let out: ExposedChainConnection[] = []
      for (const key in res) {
        if (key.startsWith("activeChains_"))
          out = [...out, ...(res[key] as ExposedChainConnection[])]
      }
      resolve(out)
    })
  })
}

export function getDefaultBootnodes(chain: string): string[] | undefined {
  if (chain === "polkadot") return polkadot.bootNodes
  if (chain === "ksmcc3") return ksmcc3.bootNodes
  if (chain === "westend2") return westend2.bootNodes
  if (chain === "rococo_v2_2") return rococo_v2_2.bootNodes
  return undefined
}

// Load default Bootnodes and save them to localStorage
export async function getBootnodes(chainName: string) {
  return await get({ type: "bootnodes", chainName })
}

export async function get<E extends StorageEntry>(
  entry: E,
): Promise<StorageEntryType<E> | undefined> {
  return new Promise((resolve) => {
    const key = keyOf(entry)
    // Note that `res[key]` will contain `undefined` is there is no such item in the
    // storage (tested on Chrome v106).
    chrome.storage.local.get([key], (res) => resolve(res[key]))
  })
}

export async function set<E extends StorageEntry>(
  entry: E,
  value: StorageEntryType<E>,
): Promise<void> {
  return new Promise((resolve) => {
    const key = keyOf(entry)
    chrome.storage.local.set({ [key]: value }, () => resolve())
  })
}

export async function remove<E extends StorageEntry>(entry: E): Promise<void> {
  return new Promise((resolve) => {
    const key = keyOf(entry)
    chrome.storage.local.remove(key, () => resolve())
  })
}

export async function clearAllActiveChains(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.get(null, (res) => {
      const keys = []
      for (const key in res) {
        if (key.startsWith("activeChains_")) keys.push(key)
      }
      chrome.storage.local.remove(keys, () => resolve())
    })
  })
}

export function onActiveChainsChanged(callback: () => void): () => void {
  const registeredCallback = (
    changes: { [key: string]: chrome.storage.StorageChange },
    areaName: chrome.storage.AreaName,
  ) => {
    if (areaName !== "local") return
    for (const key in changes) {
      if (key.startsWith("activeChains_")) callback()
    }
  }
  chrome.storage.onChanged.addListener(registeredCallback)
  return () => chrome.storage.onChanged.removeListener(registeredCallback)
}

function keyOf(entry: StorageEntry): string {
  switch (entry.type) {
    case "braveSetting":
      return "braveSetting"
    case "database":
      return entry.chainName // TODO: change this to add a prefix
    case "bootnodes":
      return "bootNodes_" + entry.chainName
    case "activeChains":
      return "activeChains_" + entry.tabId
  }
}

export interface ExposedChainConnection {
  chainId: string
  chainName: string
  isWellKnown: boolean
  tab: ExposedChainConnectionTabInfo
  isSyncing: boolean
  peers: number
  bestBlockHeight?: number
}

export interface ExposedChainConnectionTabInfo {
  id: number
  url: string
}
