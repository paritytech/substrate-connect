import { test, expect } from "./fixtures"

test("sanity", async ({ page: dappPage, extensionId, context }) => {
  test.setTimeout(5 * 60 * 1000)

  await dappPage.goto("/")

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

  const popupPage = await context.newPage()
  await popupPage.goto(`chrome-extension://${extensionId}/ui/assets/popup.html`)

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
