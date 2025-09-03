import { type Page } from "@playwright/test"
import { expect } from "./fixtures"

export const setupWallet = async (page: Page, extensionId: string) => {
  await page.goto(
    `chrome-extension://${extensionId}/ui/assets/wallet-popup.html`,
  )

  await page.getByText("Create A New Wallet").click()

  await page.getByLabel("Password", { exact: true }).fill("123456")
  await page.getByLabel("Confirm Password", { exact: true }).fill("123456")

  await page.getByText("Create Wallet").click()
}
