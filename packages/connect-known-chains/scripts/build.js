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

const child = spawn("tsup-node", [
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
])

child.stdout.setEncoding("utf8")
child.stdout.on("data", (data) => {
  console.log(data)
})

child.stderr.setEncoding("utf8")
child.stderr.on("data", (err) => console.error(err))

child.on("close", (code) => {
  console.log(`child process exited with code ${code}`)
})
