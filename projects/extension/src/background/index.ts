import { ConnectionManagerWithHealth } from "./ConnectionManagerWithHealth"
import { isEmpty } from "../utils/utils"
import settings from "./settings.json"
import { ExposedChainConnection } from "./types"
import { start as smoldotStart } from "@substrate/smoldot-light"

import westend2 from "../../public/assets/westend2.json"
import ksmcc3 from "../../public/assets/ksmcc3.json"
import polkadot from "../../public/assets/polkadot.json"
import rococo_v2 from "../../public/assets/rococo_v2.json"
import {
  ToApplication,
  ToExtension,
} from "@substrate/connect-extension-protocol"

// Note that this list doesn't necessarily always have to match the list of well-known
// chains in `@substrate/connect`. The list of well-known chains is not part of the stability
// guarantees of the connect <-> extension protocol and is thus allowed to change
// between versions of the extension. For this reason, we don't use the `WellKnownChain`
// enum from `@substrate/connect` but instead manually make the list in that enum match
// the list present here.
export const wellKnownChains: Map<string, string> = new Map<string, string>([
  [polkadot.id, JSON.stringify(polkadot)],
  [ksmcc3.id, JSON.stringify(ksmcc3)],
  [rococo_v2.id, JSON.stringify(rococo_v2)],
  [westend2.id, JSON.stringify(westend2)],
])

export interface Background extends Window {
  manager: {
    onManagerStateChanged: (
      listener: (state: ExposedChainConnection[]) => void,
    ) => () => void
    disconnectTab: (tabId: number) => void
    getLogger: () => LogKeeper
  }
}

interface logStructure {
  unix_timestamp: number
  level: number
  target: string
  message: string
}

interface LogKeeper {
  all: logStructure[]
  warn: logStructure[]
  error: logStructure[]
}

const logKeeper: LogKeeper = {
  all: [],
  warn: [],
  error: [],
}

const logger = (level: number, target: string, message: string) => {
  const incLog = {
    unix_timestamp: new Date().getTime(),
    level,
    target,
    message,
  }
  const { error, warn, all } = logKeeper
  if (level !== 4) {
    // log all non-debug logs to background console
    switch (level) {
      case 0:
      case 1:
        if (error.length >= 1000) error.shift()
        error.push(incLog)
        console.error(`[${target}] ${message}`)
        break
      case 2:
        if (warn.length >= 1000) warn.shift()
        warn.push(incLog)
        console.warn(`[${target}] ${message}`)
        break
      case 3:
        console.info(`[${target}] ${message}`)
        break
    }
  }

  if (all.length >= 1000) all.shift()
  all.push(incLog)
}

const listeners: Set<(state: ExposedChainConnection[]) => void> = new Set()

const notifyListener = (
  manager: ConnectionManagerWithHealth<chrome.runtime.Port>,
  listener: (state: ExposedChainConnection[]) => void,
) => {
  listener(
    manager.allChains
      .filter((info) => info.apiInfo)
      .map((info) => {
        return {
          chainId: info.apiInfo!.chainId,
          chainName: info.chainName,
          tabId: info.apiInfo!.sandboxId.sender!.tab!.id!,
          url: info.apiInfo!.sandboxId.sender!.tab!.url!,
          isSyncing: info.isSyncing,
          peers: info.peers,
        }
      }),
  )
}

declare let window: Background
window.manager = {
  onManagerStateChanged(listener) {
    managerPromise.then((manager) => notifyListener(manager, listener))
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
  disconnectTab: (tabId: number) => {
    // Note that the manager is always ready here, otherwise the caller wouldn't be aware of any
    // `tabId`. However there is no API in JavaScript that allows assuming that a `Promise` is
    // already ready.
    managerPromise.then((manager) => {
      // Note that multiple ports can share the same `tabId`
      for (const port of manager.sandboxes) {
        if (port.sender?.tab?.id === tabId) {
          manager.deleteSandbox(port)
          port.disconnect()
        }
      }
    })
  },
  getLogger: () => logKeeper,
}

const saveChainDbContent = async (
  manager: ConnectionManagerWithHealth<chrome.runtime.Port>,
  key: string,
) => {
  const db = await manager.wellKnownChainDatabaseContent(
    key,
    chrome.storage.local.QUOTA_BYTES / wellKnownChains.size,
  )
  chrome.storage.local.set({ [key]: db })
}

// Start initializing a `ConnectionManagerWithHealth`.
// This initialization operation shouldn't take more than a few dozen milliseconds, but we still
// need to properly handle situations where initialization isn't finished yet.
const managerPromise: Promise<
  ConnectionManagerWithHealth<chrome.runtime.Port>
> = (async () => {
  const managerInit = new ConnectionManagerWithHealth<chrome.runtime.Port>(
    smoldotStart({
      maxLogLevel: 4,
      logCallback: logger,
    }),
  )
  for (const [key, value] of wellKnownChains.entries()) {
    const dbContent = await new Promise<string | undefined>((res) =>
      chrome.storage.local.get([key], (val) => res(val[key] as string)),
    )

    await managerInit.addWellKnownChain(key, value, dbContent)
    if (!dbContent) saveChainDbContent(managerInit, key)
  }

  // Create an alarm that will periodically save the content of the database of the well-known
  // chains.
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "DatabaseContentAlarm") {
      for (const [key] of wellKnownChains) saveChainDbContent(managerInit, key)
    }
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

  let managerWithSandbox = managerPromise.then((manager) => {
    manager.addSandbox(port)
    ;(async () => {
      while (true) {
        let message
        try {
          message = await manager.nextSandboxMessage(port)
        } catch (error) {
          // An error is thrown by `nextSandboxMessage` if the sandbox is destroyed.
          break
        }

        if (message.type === "chains-status-changed") {
          listeners.forEach((listener) => notifyListener(manager, listener))
        } else {
          if (message.type === "chain-ready" || message.type === "error")
            listeners.forEach((listener) => notifyListener(manager, listener))

          // We make sure that the message is indeed of type `ToApplication`.
          const messageCorrectType: ToApplication = message
          port.postMessage(messageCorrectType)
        }
      }
    })()

    return manager
  })

  port.onMessage.addListener((message: ToExtension) => {
    managerWithSandbox = managerWithSandbox.then((manager) => {
      manager.sandboxMessage(port, message)
      if (
        message.type === "add-chain" ||
        message.type === "add-well-known-chain"
      )
        listeners.forEach((listener) => notifyListener(manager, listener))
      return manager
    })
  })

  port.onDisconnect.addListener(() => {
    managerWithSandbox = managerWithSandbox.then((manager) => {
      manager.deleteSandbox(port)
      listeners.forEach((listener) => notifyListener(manager, listener))
      return manager
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
