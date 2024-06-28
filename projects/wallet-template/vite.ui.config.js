import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import path from "node:path"

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  assetsInclude: ["src/fonts/**"],
  base: "/ui",
  build: {
    sourcemap: mode === "production" ? false : "inline",
    minify: mode === "production",
    outDir: `dist/ui`,
    rollupOptions: {
      input: {
        options: "assets/options.html",
        walletPopup: "assets/wallet-popup.html",
      },
    },
  },
}))
