export type StorageEntry =
  | { type: "notifications" }
  | { type: "braveSetting" }
  | { type: "database"; chainName: string }
  | { type: "bootnodes"; chainName: string }
  | { type: "activeChains" }

/**
 * Whenever the content of the `activeChains` storage item is modified, a message must be sent
 * within the extension using `chrome.runtime.sendMessage`. The payload of this message must be
 * this value.
 */
export const CHAINS_CHANGED_MESSAGE_DATA = "chains have changed"

export type StorageEntryType<E extends StorageEntry> =
  E["type"] extends "notifications"
    ? boolean
    : E["type"] extends "braveSetting"
    ? boolean
    : E["type"] extends "database"
    ? string
    : E["type"] extends "bootnodes"
    ? string[]
    : E["type"] extends "activeChains"
    ? ExposedChainConnection[]
    : never

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

function keyOf(entry: StorageEntry): string {
  switch (entry.type) {
    case "notifications":
      return "notifications"
    case "braveSetting":
      return "braveSetting"
    case "database":
      return entry.chainName // TODO: change this to add a prefix
    case "bootnodes":
      return "bootNodes_" + entry.chainName
    case "activeChains":
      return "activeChains"
  }
}

export interface ExposedChainConnection {
  chainId: string
  chainName: string
  tab: ExposedChainConnectionTabInfo
  isSyncing: boolean
  peers: number
  bestBlockHeight?: number
}

export interface ExposedChainConnectionTabInfo {
  id: number
  url: string
}
