import { test, expect } from "./fixtures"
import { DEV_PHRASE, sr25519, ss58Address } from "@polkadot-labs/hdkd-helpers"
import { toHex } from "@polkadot-api/utils"
import { sr25519_secret_from_seed } from "@polkadot-labs/schnorrkel-wasm"
import { setupWallet } from "./utils"
import crypto from "crypto"

test("add account", async ({ extensionId, context }) => {
  test.setTimeout(5 * 60 * 1000)

  const popupPage = await context.newPage()
  await setupWallet(popupPage, extensionId)

  await popupPage.getByText("Add").click()
  await popupPage
    .getByLabel("Crypto Key Name", { exact: true })
    .fill("Playwright CI")

  await popupPage.getByText("Next").click()

  for (const chain of ["Polkadot", "Westend", "Kusama"]) {
    await popupPage.getByLabel(chain).check()
    expect(popupPage.getByLabel(chain)).toBeChecked()
  }

  await popupPage.getByText("Next").click()

  await popupPage.getByLabel("I have written down my seed phrase.").check()
  expect(
    popupPage.getByLabel("I have written down my seed phrase."),
  ).toBeChecked()

  await popupPage.getByText("Finish").click()
})

test("import expanded private key", async ({ extensionId, context }) => {
  test.setTimeout(5 * 60 * 1000)

  const popupPage = await context.newPage()
  await setupWallet(popupPage, extensionId)

  await popupPage.getByText("Import").click()

  const seed = new Uint8Array(32)
  const expandedPrivateKeyBytes = sr25519_secret_from_seed(seed)

  const address = ss58Address(sr25519.getPublicKey(expandedPrivateKeyBytes))

  await popupPage.getByText("Expanded Private Key").click()
  await popupPage
    .getByLabel("Expanded Private Key")
    .fill(toHex(expandedPrivateKeyBytes).slice(2))

  await popupPage
    .getByLabel("Crypto Key Name", { exact: true })
    .fill("Imported")

  await popupPage.getByText("Import Wallet").click()

  // Wait 2.5 seconds for the form to submit
  await popupPage.waitForTimeout(2500)

  await popupPage.reload()

  await popupPage.getByTestId("accounts-select").click()
  await popupPage.getByTestId("accounts-select-Imported").click()
  await popupPage.getByTestId("Account 0-expand").click()

  await expect(popupPage.getByLabel("Account Address")).toHaveText(address)

  await popupPage.getByLabel("Copy to clipboard").click()

  const clipboardText = await popupPage.evaluate(
    "navigator.clipboard.readText()",
  )

  expect(clipboardText).toEqual(address)

  await popupPage.getByLabel("Go Back").click()
})

test("import mnemonic", async ({ extensionId, context }) => {
  test.setTimeout(5 * 60 * 1000)

  const popupPage = await context.newPage()
  await setupWallet(popupPage, extensionId)

  await popupPage.getByText("Import").click()

  await popupPage.getByText("Mnemonic").click()
  await popupPage.getByLabel("Mnemonic").fill(DEV_PHRASE)

  await popupPage
    .getByLabel("Crypto Key Name", { exact: true })
    .fill("Imported")

  for (const chain of ["Polkadot", "Westend", "Kusama"]) {
    await popupPage.getByLabel(chain).check()
    expect(popupPage.getByLabel(chain)).toBeChecked()
  }

  await popupPage.getByText("Import Wallet").click()

  // Wait 2.5 seconds for the form to submit
  await popupPage.waitForTimeout(2500)

  await popupPage.reload()

  await popupPage.getByTestId("accounts-select").click()
  await popupPage.getByTestId("accounts-select-Imported").click()

  for (const derivationPath of [
    "//polkadot//0",
    "//westend2//0",
    "//ksmcc3//0",
  ]) {
    await popupPage.getByTestId(`${derivationPath}-expand`).click()

    // we don't know the address so just use `toBeDefined`
    expect(popupPage.getByLabel("Account Address")).toBeDefined()

    await popupPage.getByLabel("Copy to clipboard").click()

    const clipboardText = await popupPage.evaluate(
      "navigator.clipboard.readText()",
    )

    // we don't know the address so just use `toBeDefined`
    expect(clipboardText).toBeDefined()

    await popupPage.getByLabel("Go Back").click()
  }
})

test("password", async ({ extensionId, context }) => {
  test.setTimeout(5 * 60 * 1000)

  const popupPage = await context.newPage()
  await setupWallet(popupPage, extensionId)

  await popupPage.getByText("Debug").click()

  await popupPage.getByText("Lock Wallet").click()

  await popupPage.getByLabel("Password", { exact: true }).fill("123456")

  await popupPage.getByText("Unlock Wallet").click()

  await popupPage.getByText("Change Password").click()

  await popupPage.getByLabel("Current Password", { exact: true }).fill("123456")

  await popupPage.getByLabel("New Password", { exact: true }).fill("654321")

  await popupPage
    .getByLabel("Confirm New Password", { exact: true })
    .fill("654321")

  await popupPage.getByText("Submit").click()

  await popupPage.getByText("Lock Wallet").click()

  await popupPage.getByLabel("Password", { exact: true }).fill("654321")

  await popupPage.getByText("Unlock Wallet").click()

  await popupPage.getByText("Home").click()
})
