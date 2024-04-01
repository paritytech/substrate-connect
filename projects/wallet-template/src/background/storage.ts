import type { KeystoreV4WithMeta } from "./keystore"

const STORAGE_PREFIX = "wallet-template/"

type StorageConfig = {
  keystore: KeystoreV4WithMeta
}

type StorageKey = keyof StorageConfig

const getKey = (key: StorageKey) => `${STORAGE_PREFIX}${key}`

export const remove = (keyOrKeys: StorageKey | StorageKey[]): Promise<void> =>
  chrome.storage.local.remove(
    Array.isArray(keyOrKeys) ? keyOrKeys.map(getKey) : getKey(keyOrKeys),
  )

export const get = async <K extends StorageKey>(
  key: K,
): Promise<StorageConfig[K] | undefined> => {
  const key_ = getKey(key)
  const { [key_]: value } = await chrome.storage.local.get([key_])
  return value
}

export const set = <K extends StorageKey>(
  key: K,
  value: StorageConfig[K],
): Promise<void> => chrome.storage.local.set({ [getKey(key)]: value })
