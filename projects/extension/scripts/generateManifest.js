import fs from "node:fs/promises"
import path from "node:path"
import url from "node:url"

const [src, dst] = process.argv.slice(2)

const manifest = JSON.parse(await fs.readFile(src, { encoding: "utf-8" }))
const pkg = JSON.parse(
  await fs.readFile(
    path.resolve(
      path.dirname(url.fileURLToPath(import.meta.url)),
      "../package.json",
    ),
  ),
)

manifest.version = pkg.version

await fs.writeFile(dst, JSON.stringify(manifest, undefined, 2), {
  encoding: "utf8",
})
