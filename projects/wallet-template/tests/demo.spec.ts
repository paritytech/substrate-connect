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

  await dappPage.goto("/")
  await dappPage.bringToFront()

  await expect(dappPage).toHaveTitle(/Demo/)

  for (const chainName of [
    "Polkadot",
    "Kusama",
    "Paseo",
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
    "Paseo Testnet",
    "Polkadot Asset Hub",
    "Kusama Asset Hub",
  ]

  for (const chainName of extensionPageChainNames) {
    const chain = popupPage.getByTestId(`chain${chainName}`)
    await expect(chain).toBeVisible()
    const blockHeight = popupPage.getByTestId(`${chainName}-blockheight`)
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
    const blockHeight = popupPage.getByTestId(`${chainName}-blockheight`)
    await expect(blockHeight).not.toBeEmpty()
    expect(
      +(await blockHeight.getAttribute("data-blockheight"))!,
    ).toBeGreaterThan(0)
  }
})
