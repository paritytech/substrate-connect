import { promisify } from "util"
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFile as _readFile,
  writeFile as _writeFile,
} from "fs"
import path from "path"

const readFile = promisify(_readFile)
const writeFile = promisify(_writeFile)

const BASE_PATH = "./src/connector/specs"

const files = readdirSync(BASE_PATH)

const type = process.argv.slice(2)

if (!type || (type[0] !== "esm" && type[0] !== "cjs"))
  throw new Error("Type `esm` or `cjs` must be provided.")
const url = "./dist/" + type[0] + "/connector/specs/generated/"

const processFile = async (fileName) => {
  const rawStr = await readFile(path.join(BASE_PATH, fileName), "utf8")
  const fileStr = `export default \`${JSON.stringify(JSON.parse(rawStr))}\``
  await writeFile(
    `${path.join(url, fileName.slice(0, -5))}.js`,
    fileStr,
    "utf8",
  )
}

if (!existsSync(url)) {
  mkdirSync(url, { resursive: true })
}

Promise.all(files.filter((file) => file.endsWith(".json")).map(processFile))
