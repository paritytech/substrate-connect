const extensionPrefix = "@substrate/light-client-extension-helper"

const contextPrefix = `${extensionPrefix}-context`
export const CONTEXT = {
  CONTENT_SCRIPT: `${contextPrefix}-content-script`,
  BACKGROUND: `${contextPrefix}-background`,
  EXTENSION_PAGE: `${contextPrefix}-extension-page`,
  WEB_PAGE: `${contextPrefix}-web-page`,
} as const

const portPrefix = `${extensionPrefix}-port`
export const PORT = {
  CONTENT_SCRIPT: `${portPrefix}-content-script`,
  EXTENSION_PAGE: `${portPrefix}-extension-page`,
  WEB_PAGE: `${portPrefix}-web-page`,
} as const

export const STORAGE_PREFIX = extensionPrefix

const alarmPrefix = `${extensionPrefix}-alarm`
export const ALARM = {
  DATABASE_UPDATE: `${alarmPrefix}-database-update`,
} as const

export const KEEP_ALIVE_INTERVAL = 20_000
