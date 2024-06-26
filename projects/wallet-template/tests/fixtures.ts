import { test as base, chromium, type BrowserContext } from "@playwright/test"

export const test = base.extend<{
  context: BrowserContext
  extensionId: string
}>({
  context: async ({}, use) => {
    const pathToExtension = new URL("../dist", import.meta.url).pathname
    const context = await chromium.launchPersistentContext("", {
      headless: false,
      args: [
        ...(!!process.env.CI ? [`--headless=new`] : []),
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    })
    await use(context)
    await context.close()
  },
  extensionId: async ({ context }, use) => {
    let [background] = context.serviceWorkers()
    if (!background) background = await context.waitForEvent("serviceworker")

    const extensionId = background.url().split("/")[2]
    await use(extensionId)
  },
})
export const expect = test.expect
