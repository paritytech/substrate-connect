/* eslint-disable @typescript-eslint/no-floating-promises */

import { ConnectionManager } from "./ConnectionManager"
import { logger } from "@polkadot/util"
import { isEmpty } from "../utils/utils"
import settings from "./settings.json"
import { ExposedChainConnection } from "./types"

import westend from "../../public/assets/westend.json"
import kusama from "../../public/assets/kusama.json"
import polkadot from "../../public/assets/polkadot.json"
import rococo from "../../public/assets/rococo.json"
import { ToExtension } from "@substrate/connect-extension-protocol"

export const wellKnownChains: Map<string, string> = new Map<string, string>([
  ["polkadot", JSON.stringify(polkadot)],
  ["kusama", JSON.stringify(kusama)],
  ["rococo", JSON.stringify(rococo)],
  ["westend", JSON.stringify(westend)],
])

export interface Background extends Window {
  manager: {
    onManagerStateChanged: (
      listener: (state: ExposedChainConnection[]) => void,
    ) => () => void
    disconnectTab: (tabId: number) => void
  }
}

let manager: ConnectionManager<chrome.runtime.Port>

const publicManager: Background["manager"] = {
  onManagerStateChanged(listener) {
    listener(
      manager.allChains.map((info) => {
        return {
          chainId: info.apiInfo ? info.apiInfo.chainId : "",
          chainName: info.chainName,
          tabId: info.apiInfo ? info.apiInfo.sandboxId.sender!.tab!.id! : 0,
          url: info.apiInfo ? info.apiInfo.sandboxId.sender!.tab!.url! : "",
          healthStatus: info.healthStatus,
        }
      }),
    )
    //manager.on("stateChanged", listener)
    return () => {
      //manager.removeListener("stateChanged", listener)
    }
  },
  disconnectTab: (tabId: number) => {
    for (const port of manager.sandboxes) {
      if (port.sender?.tab?.id === tabId) {
        manager.deleteSandbox(port)
        break
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

const saveChainDbContent = async (key: string) => {
  const db = await manager.wellKnownChainDatabaseContent(
    key,
    chrome.storage.local.QUOTA_BYTES / wellKnownChains.size,
  )
  chrome.storage.local.set({ [key]: db })
}

const flushDatabases = (): void => {
  for (const [key, _] of wellKnownChains) saveChainDbContent(key)
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "DatabaseContentAlarm") flushDatabases()
})

const init = async () => {
  try {
    manager = new ConnectionManager()
    for (const [key, value] of wellKnownChains.entries()) {
      const dbContent = await new Promise<string | undefined>((res) =>
        chrome.storage.local.get([key], (val) => res(val[key] as string)),
      )

      await manager.addWellKnownChain(key, value, dbContent)
      if (!dbContent) saveChainDbContent(key)
    }

    chrome.alarms.create("DatabaseContentAlarm", {
      periodInMinutes: 5,
    })
  } catch (e) {
    l.error(`Error creating smoldot: ${e}`)
    //manager?.shutdown()
  }
}

chrome.runtime.onInstalled.addListener(() => {
  init()
})

chrome.runtime.onStartup.addListener(() => {
  init()
})

chrome.runtime.onConnect.addListener((port) => {
  manager.addSandbox(port)

  ;(async () => {
    for await (const message of manager.sandboxOutput(port)) {
      port.postMessage(message)
    }
  })()

  port.onMessage.addListener((message: ToExtension) => {
    manager.sandboxMessage(port, message)
  })

  port.onDisconnect.addListener(() => {
    manager.deleteSandbox(port)
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

// TODO (nik): once extension is on chrome/ff stores we need to take advantage
// of the onBrowserUpdateAvailable and onUpdateAvailable lifecycle event
// NOTE: onSuspend could be used to cleanup things but async actions are not guaranteed to complete :(
