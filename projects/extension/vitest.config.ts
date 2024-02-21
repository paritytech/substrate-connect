import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: "playwright",
      name: "firefox",
      headless: true,
    },
    exclude: ["tests"],
  },
})
