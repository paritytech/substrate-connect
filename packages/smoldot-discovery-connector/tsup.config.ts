import { defineConfig } from "tsup"

export default defineConfig([
  {
    entry: {
      index: "src/index.ts",
    },
    outDir: "dist/esm",
    format: ["esm"],
    dts: true,
    sourcemap: true,
    clean: true,
    tsconfig: "./tsconfig.build.json",
    noExternal: ["effect"],
  },
  {
    entry: {
      index: "src/index.ts",
    },
    outDir: "dist/commonjs",
    format: ["cjs"],
    dts: true,
    sourcemap: true,
    clean: true,
    tsconfig: "./tsconfig.build.json",
    noExternal: ["effect"],
  },
])
