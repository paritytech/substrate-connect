import { defineConfig } from "vite"

const input = process.env.INPUT

export default defineConfig(({ mode }) => ({
  build: {
    sourcemap: mode === "production" ? true : "inline",
    outDir: `dist/${input}`,
    rollupOptions: {
      input: {
        [input]: `src/${input}/index.ts`,
      },
      output: {
        entryFileNames: (chunk) => `${chunk.name}.js`,
        inlineDynamicImports: true,
      },
    },
  },
}))
