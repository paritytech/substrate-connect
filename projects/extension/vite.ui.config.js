import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: "/ui",
  build: {
    sourcemap: mode === "production" ? true : "inline",
    outDir: `dist/ui`,
    rollupOptions: {
      input: {
        popup: "assets/popup.html",
        options: "assets/options.html",
      },
    },
  },
}))
