import { defineConfig } from "vite"

const input = process.env.INPUT

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
        inlineDynamicImports: true,
      },
    },
  },
}))
