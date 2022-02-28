import { ConnectionManager } from "./ConnectionManager"
import { logger } from "@polkadot/util"
import { isEmpty } from "../utils/utils"
import settings from "./settings.json"
import { ExposedChainConnection } from "./types"
import { WellKnownChain } from "@substrate/connect"
import { start as smoldotStart } from "@substrate/smoldot-light"

import westend2 from "../../public/assets/westend2.json"
import ksmcc3 from "../../public/assets/ksmcc3.json"
import polkadot from "../../public/assets/polkadot.json"
import rococo_v2 from "../../public/assets/rococo_v2.json"
import { ToExtension } from "@substrate/connect-extension-protocol"

export const wellKnownChains: Map<string, string> = new Map<string, string>([
  [WellKnownChain.polkadot, JSON.stringify(polkadot)],
  [WellKnownChain.ksmcc3, JSON.stringify(ksmcc3)],
  [WellKnownChain.rococo_v2, JSON.stringify(rococo_v2)],
  [WellKnownChain.westend2, JSON.stringify(westend2)],
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
let listeners: Set<(state: ExposedChainConnection[]) => void> = new Set()

const notifyListener = (
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
          healthStatus: info.healthStatus,
        }
      }),
  )
}

const publicManager: Background["manager"] = {
  onManagerStateChanged(listener) {
    notifyListener(listener)
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

const saveChainDbContent = async (key: string) => {
  const db = await manager.wellKnownChainDatabaseContent(
    key,
    chrome.storage.local.QUOTA_BYTES / wellKnownChains.size,
  )
  chrome.storage.local.set({ [key]: db })
}

const flushDatabases = (): void => {
  for (const [key] of wellKnownChains) saveChainDbContent(key)
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "DatabaseContentAlarm") flushDatabases()
})

const waitAllChainsUpdate = () => {
  listeners.forEach(notifyListener)
  manager.waitAllChainChanged().then(() => {
    waitAllChainsUpdate()
  })
}

const init = async () => {
  try {
    manager = new ConnectionManager(smoldotStart())
    for (const [key, value] of wellKnownChains.entries()) {
      const dbContent = await new Promise<string | undefined>((res) =>
        chrome.storage.local.get([key], (val) => res(val[key] as string)),
      )

      await manager.addWellKnownChain(key, value, dbContent)
      if (!dbContent) saveChainDbContent(key)
    }

    waitAllChainsUpdate()

    chrome.alarms.create("DatabaseContentAlarm", {
      periodInMinutes: 5,
    })
  } catch (e) {
    l.error(`Error creating smoldot: ${e}`)
    //manager?.shutdown()
  }
}

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

init()
