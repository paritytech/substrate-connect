import path from "path"
import { fileURLToPath } from "url"
import { readFile, readdir, writeFile } from "node:fs/promises"
import { existsSync } from "fs"
import { mkdir } from "fs/promises"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const specsDir = path.join(__dirname, "./src/connector/specs")
const jsDir = path.join(specsDir, "./js/")
try {
  const files = await readdir(specsDir)
  const jsonFiles = files.filter((file) => file.endsWith(".json"))
  if (!existsSync(jsDir)) await mkdir(jsDir)

  await Promise.all(
    jsonFiles.map(async (file) => {
      const jsonContent = await readFile(path.join(specsDir, file), {
        encoding: "utf8",
      })

      const jsContent = `export const chainSpec = \`${jsonContent}\``
      await writeFile(path.join(jsDir, file.slice(0, -4) + "ts"), jsContent)
    }),
  )
} catch (e) {
  console.log("There was an error creating the js specs")
  console.error(e)
  process.exit(1)
}
