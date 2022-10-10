
export type StorageEntry =
  { type: "notifications" } |
  { type: "braveSetting" } |
  { type: "database", chainName: string } |
  { type: "bootnodes", chainName: string };

export type StorageEntryType<E extends StorageEntry> =
  E["type"] extends "notifications" ? boolean :
  E["type"] extends "braveSetting" ? boolean :
  E["type"] extends "database" ? string :
  E["type"] extends "bootnodes" ? string[] :
  never;

export async function get<E extends StorageEntry>(entry: E): Promise<StorageEntryType<E>> {
 return new Promise((resolve) => {
  const key = keyOf(entry);
  chrome.storage.local.get([key], (res) => resolve(res[key]))
 }) 
}

export async function set<E extends StorageEntry>(entry: E, value: StorageEntryType<E>): Promise<void> {
  return new Promise((resolve) => {
   const key = keyOf(entry);
   chrome.storage.local.set({ [key]: value }, () => resolve())
  }) 
 }

function keyOf(entry: StorageEntry): string {
  switch (entry.type) {
    case "notifications":
      return "notifications";
    case "braveSetting":
      return "braveSetting";
    case "database":
      return entry.chainName;
    case "bootnodes":
      return "bootNodes_" + entry.chainName;
  }
}
