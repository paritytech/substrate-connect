import { test, expect } from "./fixtures"

test("sanity", async ({ page }) => {
  test.setTimeout(5 * 60 * 1000)
  await page.goto("/")

  await expect(page).toHaveTitle(/Demo/)

  for (const chainName of [
    "Polkadot",
    "Kusama",
    "AssetHubPolkadot",
    "AssetHubKusama",
  ]) {
    const chain = page.getByTestId(`chain${chainName}`)
    await expect(chain).toBeVisible()
    await expect(chain).toHaveAttribute("data-blockheight", {
      timeout: 3 * 60 * 1000,
    })
    expect(+(await chain.getAttribute("data-blockheight"))!).toBeGreaterThan(0)
  }
})
