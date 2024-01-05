import { STORAGE_PREFIX } from "@/shared"

const chainStoragePrefix = `${STORAGE_PREFIX}_chain_`

type StorageConfig = {
  chain: [entry: { type: "chain"; genesisHash: string }, value: ChainInfo]
  bootNodes: [
    entry: { type: "bootNodes"; genesisHash: string },
    value: string[],
  ]
  databaseContent: [
    entry: { type: "databaseContent"; genesisHash: string },
    value: string,
  ]
}

type StorageEntry = StorageConfig[keyof StorageConfig][0]
type StorageValue<T> = T extends StorageEntry
  ? StorageConfig[T["type"]][1]
  : never

type ChainInfo = {
  genesisHash: string
  name: string
  chainSpec: string
  relayChainGenesisHash?: string
  ss58Format: number
}

const keyOf = ({ type, genesisHash }: StorageEntry) => {
  if (!type.length || !genesisHash.length) throw new Error("Invalid entry")

  return `${STORAGE_PREFIX}_${type}_${genesisHash}`
}

export const get = async <E extends StorageEntry>(
  entry: E,
): Promise<StorageValue<E> | undefined> => {
  const key = keyOf(entry)
  const { [key]: value } = await chrome.storage.local.get([key])
  return value
}

export const set = <E extends StorageEntry>(entry: E, value: StorageValue<E>) =>
  chrome.storage.local.set({ [keyOf(entry)]: value })

export const remove = (entryOrEntries: StorageEntry | StorageEntry[]) =>
  chrome.storage.local.remove(
    Array.isArray(entryOrEntries)
      ? entryOrEntries.map(keyOf)
      : keyOf(entryOrEntries),
  )

export const onChainsChanged = (
  callback: (chains: Record<string, ChainInfo>) => void,
) => {
  const listener = async (changes: {
    [key: string]: chrome.storage.StorageChange
  }) => {
    if (!Object.keys(changes).some((key) => key.startsWith(chainStoragePrefix)))
      return
    callback(await getChains())
  }
  chrome.storage.onChanged.addListener(listener)
  return () => chrome.storage.onChanged.removeListener(listener)
}

export const getChains = async (): Promise<Record<string, ChainInfo>> =>
  Object.fromEntries(
    await Promise.all(
      Object.entries(await chrome.storage.local.get())
        .filter((entry): entry is [string, ChainInfo] =>
          entry[0].startsWith(chainStoragePrefix),
        )
        .map(async ([_, { chainSpec, ...chain }]) => {
          const chainSpecJson = JSON.parse(chainSpec)
          chainSpecJson.bootNodes = await get({
            type: "bootNodes",
            genesisHash: chain.genesisHash,
          })
          return [
            chain.genesisHash,
            { ...chain, chainSpec: JSON.stringify(chainSpecJson) },
          ]
        }),
    ),
  )
