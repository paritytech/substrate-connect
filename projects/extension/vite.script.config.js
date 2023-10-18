import { defineConfig } from "vite"

const input = process.env.INPUT
const isBackground = input === "background"

export default defineConfig(({ mode }) => ({
  build: {
    sourcemap: mode === "production" ? false : "inline",
    minify: mode === "production",
    outDir: `dist/${input}`,
    rollupOptions: {
      input: {
        [input]: `src/${input}/index.ts`,
      },
      output: {
        entryFileNames: (chunk) => `${chunk.name}.js`,
        inlineDynamicImports: !isBackground,
        manualChunks: isBackground
          ? {
              "substrate-connect": ["@substrate/connect"],
            }
          : undefined,
      },
    },
  },
}))
