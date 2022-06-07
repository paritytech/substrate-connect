import { ConnectionManagerWithHealth } from "./ConnectionManagerWithHealth"
import settings from "./settings.json"
import { ExposedChainConnection } from "./types"
import { start as smoldotStart } from "@substrate/smoldot-light"

import westend2 from "../../public/assets/westend2.json"
import ksmcc3 from "../../public/assets/ksmcc3.json"
import polkadot from "../../public/assets/polkadot.json"
import rococo_v2_2 from "../../public/assets/rococo_v2_2.json"
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
  [rococo_v2_2.id, JSON.stringify(rococo_v2_2)],
  [westend2.id, JSON.stringify(westend2)],
])

export interface Background extends Window {
  uiInterface: {
    onChainsChanged: (listener: () => void) => () => void
    onSmoldotCrashErrorChanged: (listener: () => void) => () => void
    disconnectTab: (tabId: number) => void
    // List of all chains that are currently running.
    // Use `onChainsChanged` to register a callback that is called when this list or its content
    // might have changed.
    get chains(): ExposedChainConnection[]
    get logger(): LogKeeper
    // If smoldot has crashed, contains a string containing a crash message.
    // Use `onSmoldotCrashErrorChanged` to register a callback that is called when this crash
    // message might have changed.
    get smoldotCrashError(): string | undefined
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

// Listeners that must be notified when the `get chains()` getter would return a different value.
const chainsChangedListeners: Set<() => void> = new Set()
const notifyAllChainsChangedListeners = () => {
  chainsChangedListeners.forEach((l) => {
    try {
      l()
    } catch (e) {
      console.error("Uncaught exception in onChainsChanged callback:", e)
    }
  })
}
// Listeners that must be notified when the `get smoldotCrashError()` getter would return a
// different value.
const smoldotCrashErrorChangedListeners: Set<() => void> = new Set()
const notifyAllSmoldotCrashErrorChangedListeners = () => {
  smoldotCrashErrorChangedListeners.forEach((l) => {
    try {
      l()
    } catch (e) {
      console.error(
        "Uncaught exception in onSmoldotCrashErrorChanged callback:",
        e,
      )
    }
  })
}

declare let window: Background
window.uiInterface = {
  onChainsChanged(listener) {
    chainsChangedListeners.add(listener)
    return () => {
      chainsChangedListeners.delete(listener)
    }
  },
  onSmoldotCrashErrorChanged(listener) {
    smoldotCrashErrorChangedListeners.add(listener)
    return () => {
      smoldotCrashErrorChangedListeners.delete(listener)
    }
  },
  disconnectTab: (tabId: number) => {
    // Note that the manager is always ready here, otherwise the caller wouldn't be aware of any
    // `tabId`.
    if (manager.state !== "ready") return
    // Note that multiple ports can share the same `tabId`
    for (const port of manager.manager.sandboxes) {
      if (port?.sender?.tab?.id === tabId) {
        manager.manager.deleteSandbox(port)
        port.disconnect()
      }
    }
  },
  get chains(): ExposedChainConnection[] {
    if (manager.state === "ready") {
      return manager.manager.allChains.map((info) => {
        return {
          chainId: info.chainId,
          chainName: info.chainName,
          tab: info.sandboxId
            ? {
                id: info.sandboxId.sender!.tab!.id!,
                url: info.sandboxId.sender!.tab!.url!,
              }
            : undefined,
          isSyncing: info.isSyncing,
          peers: info.peers,
          bestBlockHeight: info.bestBlockHeight,
        }
      })
    } else {
      return []
    }
  },
  get logger() {
    return logKeeper
  },
  get smoldotCrashError() {
    if (manager.state === "crashed") return manager.error
    else return undefined
  },
}

// The manager can be in multiple different states: currently initializing, operational, or
// crashed.
// While initializing, the `whenInitFinished` promise can be used to know when the initialization
// is over and the manager is now operational or crashed.
let manager:
  | { state: "initializing"; whenInitFinished: Promise<void> }
  | {
      state: "ready"
      manager: ConnectionManagerWithHealth<chrome.runtime.Port | null>
    }
  | { state: "crashed"; error: string } = {
  state: "initializing",
  whenInitFinished: (async () => {})(),
}

manager = {
  state: "initializing",
  whenInitFinished: (async () => {
    try {
      // Start initializing a `ConnectionManagerWithHealth`.
      // This initialization operation shouldn't take more than a few dozen milliseconds, but we
      // still need to properly handle situations where initialization isn't finished yet.
      const managerInit =
        new ConnectionManagerWithHealth<chrome.runtime.Port | null>(
          wellKnownChains,
          smoldotStart({
            maxLogLevel: 4,
            logCallback: logger,
            cpuRateLimit: 0.5, // Politely limit the CPU usage of the smoldot background worker.
          }),
        )

      managerInit.addSandbox(null)

      const startDbQueries = []

      for (const key of wellKnownChains.keys()) {
        const dbContent = await new Promise<string | undefined>((res) =>
          chrome.storage.local.get([key], (val) => {
            return res(val[key] as string)
          }),
        )

        managerInit.sandboxMessage(null, {
          origin: "trusted-user",
          chainId: key,
          chainName: key,
          type: "add-well-known-chain-with-db",
          databaseContent: dbContent,
        })
        // Wait for the manager to confirm the chain creation.
        while (true) {
          const msg = await managerInit.nextSandboxMessage(null)
          if (msg.type === "error" && msg.chainId === key) {
            throw new Error(
              "Failed to initialize well-known chain: " + msg.errorMessage,
            )
          }
          if (msg.type === "chain-ready" && msg.chainId === key) {
            break
          }
        }

        if (!dbContent) startDbQueries.push(key)
      }

      // Query the databases of chains whose database was unknown.
      // This needs to be done after all well-known chains are initialized, otherwise the code
      // right above that waits for chains to be ready might catch the response to the database
      // query.
      for (const key of startDbQueries)
        managerInit.sandboxMessage(null, {
          origin: "trusted-user",
          type: "database-content",
          chainId: key,
          sizeLimit: chrome.storage.local.QUOTA_BYTES / wellKnownChains.size,
        })

        // TODO: stop this task if the manager crashes?
      ;(async () => {
        while (true) {
          const message = await managerInit.nextSandboxMessage(null)
          if (
            message.type === "chains-status-changed" ||
            message.type === "error"
          ) {
            notifyAllChainsChangedListeners()
          } else if (message.type === "database-content") {
            chrome.storage.local.set({
              [message.chainId]: message.databaseContent,
            })
          }
        }
      })()

      // Create an alarm that will periodically save the content of the database of the well-known
      // chains.
      chrome.alarms.onAlarm.addListener(async (alarm) => {
        if (alarm.name === "DatabaseContentAlarm") {
          for (const [key] of wellKnownChains)
            managerInit.sandboxMessage(null, {
              origin: "trusted-user",
              type: "database-content",
              chainId: key,
              sizeLimit:
                chrome.storage.local.QUOTA_BYTES / wellKnownChains.size,
            })
        }
      })
      chrome.alarms.create("DatabaseContentAlarm", {
        periodInMinutes: 5,
      })

      // Success. Update the state and notify listeners.
      notifyAllChainsChangedListeners()
      manager = { state: "ready", manager: managerInit }
    } catch (error) {
      notifyAllSmoldotCrashErrorChangedListeners()
      const msg =
        error instanceof Error
          ? error.toString()
          : "Unknown error at initialization"
      manager = { state: "crashed", error: msg }
    }
  })(),
}

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

  let managerPromise = (async () => {
    while (true) {
      if (manager.state === "initializing") {
        await manager.whenInitFinished
      } else if (manager.state === "ready") {
        return manager.manager
      } else if (manager.state === "crashed") {
        return undefined
      }
    }
  })()

  let managerWithSandbox = managerPromise.then((readyManager) => {
    if (!readyManager) return readyManager

    readyManager.addSandbox(port)
    ;(async () => {
      while (true) {
        let message
        try {
          message = await readyManager.nextSandboxMessage(port)
        } catch (error) {
          // An error is thrown by `nextSandboxMessage` if the sandbox is destroyed.
          break
        }

        if (message.type === "chains-status-changed") {
          notifyAllChainsChangedListeners()
        } else if (message.type === "database-content") {
          // We never ask for the database content of a chain added through a port.
        } else {
          if (message.type === "chain-ready" || message.type === "error")
            notifyAllChainsChangedListeners()

          // We make sure that the message is indeed of type `ToApplication`.
          const messageCorrectType: ToApplication = message
          port.postMessage(messageCorrectType)

          // If an error happened, this might be an indication that the manager has crashed.
          // If that is the case, we need to notify the UI and restart everything.
          if (message.type === "error") {
            const error = readyManager.hasCrashed
            if (error) {
              manager = { state: "crashed", error }
              notifyAllSmoldotCrashErrorChangedListeners()
              notifyAllChainsChangedListeners()
            }
          }
        }
      }
    })()

    return readyManager
  })

  port.onMessage.addListener((message: ToExtension) => {
    managerWithSandbox = managerWithSandbox.then((manager) => {
      if (manager) {
        manager.sandboxMessage(port, message)
        if (
          message.type === "add-chain" ||
          message.type === "add-well-known-chain" ||
          message.type === "remove-chain"
        ) {
          notifyAllChainsChangedListeners()
        }
      } else {
        // If the page wants to send a message while the manager has crashed, we instantly
        // return an error.
        if (
          message.type === "add-chain" ||
          message.type === "add-well-known-chain"
        ) {
          const msg: ToApplication = {
            origin: "substrate-connect-extension",
            type: "error",
            chainId: message.chainId,
            errorMessage: "Smoldot has crashed",
          }
          port.postMessage(msg)
        }
      }

      return manager
    })
  })

  port.onDisconnect.addListener(() => {
    managerWithSandbox = managerWithSandbox.then((manager) => {
      if (!manager) return manager

      manager.deleteSandbox(port)
      notifyAllChainsChangedListeners()
      return manager
    })
  })
})

chrome.storage.local.get(["notifications"], (result) => {
  if (Object.keys(result).length === 0) {
    // Setup default settings
    chrome.storage.local.set({ notifications: settings.notifications }, () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError)
      }
    })
  }
})
