import { test, expect } from "./fixtures"

test("sanity", async ({ page }) => {
  test.setTimeout(5 * 60 * 1000)
  await page.goto("/")

  await expect(page).toHaveTitle(/extension-dapp/)
  await expect(page.locator("h1")).toHaveText("Extension Test DApp")

  for (const chainName of ["Polkadot", "Kusama", "Westend"]) {
    const chain = page.getByTestId(`chain${chainName}`)
    await expect(chain).toBeVisible()
    const blockHeight = chain.getByTestId("blockHeight")
    expect(
      +(await blockHeight.getAttribute("data-blockheight", {
        timeout: 3 * 60 * 1000,
      }))!,
    ).toBeGreaterThan(0)
  }
})
