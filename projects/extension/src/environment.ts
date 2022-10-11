export type StorageEntry =
  | { type: "notifications" }
  | { type: "braveSetting" }
  | { type: "database"; chainName: string }
  | { type: "bootnodes"; chainName: string }
  | { type: "activeChains" }

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

export function onChanged<E extends StorageEntry>(entry: E, callback: (newValue: StorageEntryType<E>) => void): () => void {
  const key = keyOf(entry);
  const registeredCallback = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: chrome.storage.AreaName) => {
    if (areaName === 'local' && changes[key])
      callback(changes[key].newValue)
  };
  chrome.storage.onChanged.addListener(registeredCallback)
  return () => chrome.storage.onChanged.removeListener(registeredCallback)
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
