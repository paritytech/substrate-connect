import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: "/ui",
  build: {
    sourcemap: mode === "production" ? false : "inline",
    minify: mode === "production",
    outDir: `dist/ui`,
    rollupOptions: {
      input: {
        popup: "assets/popup.html",
        options: "assets/options.html",
      },
    },
  },
}))
