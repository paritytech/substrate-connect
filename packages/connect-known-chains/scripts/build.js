// @ts-check
import path from "path"
import { fileURLToPath } from "url"
import { readdir } from "node:fs/promises"
import { spawn } from "child_process"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const jsDir = path.join(__dirname, "../src/specs/")

const files = await readdir(jsDir)
const tsFiles = files.filter((file) => file.endsWith(".ts"))

const paths = tsFiles.map((fileName) => `src/specs/${fileName}`)

const tsupNode = spawn(
  "tsup-node",
  [
    "src/index.ts",
    ...paths,
    "--clean",
    "--sourcemap",
    "--platform",
    "neutral",
    "--target=es2015",
    "--format",
    "esm,cjs",
    "--dts",
  ],
  {
    stdio: ["inherit", "inherit", "inherit"],
  },
)

tsupNode.on("close", (code) => {
  process.exitCode = code ?? 1
})
