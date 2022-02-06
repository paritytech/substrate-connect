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

const BASE_PATH = "./src/specs"

const files = readdirSync(BASE_PATH)

/* eslint-disable */
const processFile = async (fileName) => {
  const rawStr = await readFile(path.join(BASE_PATH, fileName), "utf8")
  const fileStr = `export default \`${JSON.stringify(JSON.parse(rawStr))}\``
  await writeFile(
    `${path.join("./dist/specs/generated/", fileName.slice(0, -5))}.js`,
    fileStr,
    "utf8",
  )
}

if (!existsSync("./dist/specs/generated")) {
  mkdirSync("./dist/specs/generated", { resursive: true })
}

Promise.all(files.filter((file) => file.endsWith(".json")).map(processFile))
