export type StorageEntry = { type: "braveSetting" }

export type StorageEntryType<E extends StorageEntry> =
  E["type"] extends "braveSetting" ? boolean : never

export async function getDefaultBootnodes(
  chain: string,
): Promise<string[] | undefined> {
  if (
    ["polkadot", "ksmcc3", "westend2", "rococo_v2_2", "paseo"].includes(chain)
  ) {
    const bootNodes = (
      await (
        await fetch(chrome.runtime.getURL(`./chainspecs/${chain}.json`))
      ).json()
    )?.bootNodes as string[]
    return bootNodes
  }
  return undefined
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

function keyOf(entry: StorageEntry): string {
  switch (entry.type) {
    case "braveSetting":
      return "braveSetting"
  }
}
