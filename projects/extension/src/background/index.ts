import { ConnectionManager } from "./ConnectionManager"
import { logger } from "@polkadot/util"
import { isEmpty } from "../utils/utils"
import settings from "./settings.json"
import { ExposedChainConnection } from "./types"
import { WellKnownChains } from "@substrate/connect"
import { start as smoldotStart } from "@substrate/smoldot-light"

import westend2 from "../../public/assets/westend2.json"
import ksmcc3 from "../../public/assets/ksmcc3.json"
import polkadot from "../../public/assets/polkadot.json"
import rococo_v2 from "../../public/assets/rococo_v2.json"
import { ToExtension } from "@substrate/connect-extension-protocol"

export const wellKnownChains: Map<string, string> = new Map<string, string>([
  [WellKnownChains.polkadot, JSON.stringify(polkadot)],
  [WellKnownChains.ksmcc3, JSON.stringify(ksmcc3)],
  [WellKnownChains.rococo_v2, JSON.stringify(rococo_v2)],
  [WellKnownChains.westend2, JSON.stringify(westend2)],
])

export interface Background extends Window {
  manager: {
    onManagerStateChanged: (
      listener: (state: ExposedChainConnection[]) => void,
    ) => () => void
    disconnectTab: (tabId: number) => void
  }
}

const listeners: Set<(state: ExposedChainConnection[]) => void> = new Set()

const notifyListener = (
  mgr: ConnectionManager<chrome.runtime.Port>,
  listener: (state: ExposedChainConnection[]) => void,
) => {
  listener(
    mgr.allChains
      .filter((info) => info.apiInfo)
      .map((info) => {
        return {
          chainId: info.apiInfo!.chainId,
          chainName: info.chainName,
          tabId: info.apiInfo!.sandboxId.sender!.tab!.id!,
          url: info.apiInfo!.sandboxId.sender!.tab!.url!,
          healthStatus: info.healthStatus,
        }
      }),
  )
}

const publicManager: Background["manager"] = {
  onManagerStateChanged(listener) {
    notifyListener(manager, listener)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
  disconnectTab: (tabId: number) => {
    // Note that multiple ports can share the same `tabId`
    for (const port of manager.sandboxes) {
      if (port.sender?.tab?.id === tabId) {
        manager.deleteSandbox(port)
        port.disconnect()
      }
    }
  },
}

declare let window: Background
window.manager = publicManager

const l = logger("Extension")

export interface RequestRpcSend {
  method: string
  params: unknown[]
}

const saveChainDbContent = async (
  mgr: ConnectionManager<chrome.runtime.Port>,
  key: string,
) => {
  const db = await mgr.wellKnownChainDatabaseContent(
    key,
    chrome.storage.local.QUOTA_BYTES / wellKnownChains.size,
  )
  chrome.storage.local.set({ [key]: db })
}

const flushDatabases = (mgr: ConnectionManager<chrome.runtime.Port>): void => {
  for (const [key, _] of wellKnownChains) saveChainDbContent(mgr, key)
}

const waitAllChainsUpdate = (mgr: ConnectionManager<chrome.runtime.Port>) => {
  listeners.forEach((listener) => notifyListener(mgr, listener))
  mgr.waitAllChainChanged().then(() => {
    waitAllChainsUpdate(mgr)
  })
}

const manager: Promise<ConnectionManager<chrome.runtime.Port>> = (async () => {
  const managerInit = new ConnectionManager<chrome.runtime.Port>(smoldotStart())
  for (const [key, value] of wellKnownChains.entries()) {
    const dbContent = await new Promise<string | undefined>((res) =>
      chrome.storage.local.get([key], (val) => res(val[key] as string)),
    )

    await managerInit.addWellKnownChain(key, value, dbContent)
    if (!dbContent) saveChainDbContent(managerInit, key)
  }

  waitAllChainsUpdate(managerInit)

  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "DatabaseContentAlarm") flushDatabases(managerInit)
  })
  chrome.alarms.create("DatabaseContentAlarm", {
    periodInMinutes: 5,
  })

  return managerInit
})()

// Handle new port connections.
//
// Whenever a tab starts using the substrate-connect extension, it will open a port. This is caught
// here.
chrome.runtime.onConnect.addListener((port) => {
  // The difficulty here is that the manager might not have completely finished its
  // initialization. However, we need to immediately add listeners to `port.onMessage` and
  // to `port.onDisconnect` in order to be sure to not miss events.

  // To handle this properly, we hold a `Promise` here, and update it every time we do
  // something relevant to that port, making sure that everything happens in the correct order.

  // Note that as long as the manager hasn't finished initializing, the chain of promises will
  // continue to grow indefinitely. While this is a problem *in theory*, in practice the manager
  // initialization shouldn't take more than a few dozen milliseconds and it is actually unlikely
  // for any message to arrive at all.

  let managerWithSandbox = manager.then((mgr) => {
    mgr.addSandbox(port);

    ;(async () => {
      for await (const message of mgr.sandboxOutput(port)) {
        port.postMessage(message)
      }
    })()

    return mgr;
  });

  port.onMessage.addListener((message: ToExtension) => {
    managerWithSandbox = managerWithSandbox.then((mgr) => {
      mgr.sandboxMessage(port, message);
      return mgr;
    })
  })

  port.onDisconnect.addListener(() => {
    managerWithSandbox = managerWithSandbox.then((mgr) => {
      mgr.deleteSandbox(port);
      return mgr;
    })
  })
})

chrome.storage.local.get(["notifications"], (result) => {
  if (isEmpty(result)) {
    // Setup default settings
    chrome.storage.local.set({ notifications: settings.notifications }, () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError)
      }
    })
  }
})
