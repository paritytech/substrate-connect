import { test, expect } from "./fixtures"

test("sanity", async ({ page: dappPage, extensionId, context }) => {
  test.setTimeout(5 * 60 * 1000)

  const popupPage = await context.newPage()
  await popupPage.goto(
    `chrome-extension://${extensionId}/ui/assets/wallet-popup.html`,
  )

  await popupPage.getByText("Create A New Wallet").click()

  await popupPage.getByLabel("Password", { exact: true }).fill("123456")
  await popupPage.getByLabel("Confirm Password", { exact: true }).fill("123456")

  await popupPage.getByText("Create Wallet").click()

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

  await dappPage.goto("/")
  await dappPage.bringToFront()

  await expect(dappPage).toHaveTitle(/Demo/)

  for (const chainName of [
    "Polkadot",
    "Kusama",
    "AssetHubPolkadot",
    "AssetHubKusama",
  ]) {
    const chain = dappPage.getByTestId(`chain${chainName}`)
    await expect(chain).toBeVisible()
    await expect(chain).toHaveAttribute("data-blockheight", {
      timeout: 3 * 60 * 1000,
    })
    expect(+(await chain.getAttribute("data-blockheight"))!).toBeGreaterThan(0)
  }

  await popupPage.bringToFront()
  await popupPage.getByText("Networks").click()

  const extensionPageChainNames = [
    "Polkadot",
    "Kusama",
    "Polkadot Asset Hub",
    "Kusama Asset Hub",
  ]

  for (const chainName of extensionPageChainNames) {
    const chain = popupPage.getByTestId(`chain${chainName}`)
    await expect(chain).toBeVisible()
    const blockHeight = chain.getByTestId("blockheight")
    await expect(blockHeight).not.toContainText("Syncing")
    expect(
      +(await blockHeight.getAttribute("data-blockheight"))!,
    ).toBeGreaterThan(0)
  }

  const optionsPagePromise = context.waitForEvent("page")
  await popupPage.getByTestId("btnGoToOptions").click()
  const optionsPage = await optionsPagePromise
  await optionsPage.waitForLoadState()

  for (const chainName of extensionPageChainNames) {
    const chain = optionsPage!.getByTestId(`chain${chainName}`)
    await expect(chain).toBeVisible()
    await chain.click()
    const blockHeight = chain.getByTestId("blockheight")
    await expect(blockHeight).not.toBeEmpty()
    expect(
      +(await blockHeight.getAttribute("data-blockheight"))!,
    ).toBeGreaterThan(0)
  }
})
