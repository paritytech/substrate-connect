import { defineConfig } from "vitest/config"
import { WxtVitest } from "wxt/testing"

export default defineConfig({
  plugins: [WxtVitest()],
  ssr: {
    noExternal: ["@webext-core/storage"],
  },
  test: {
    exclude: ["tests", "node_modules"],
  },
})
