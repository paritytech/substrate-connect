import { readFile as cbReadFile } from "fs"
import { promisify } from "util"

const readFile = promisify(cbReadFile)

const [rootPkg, connectPkg] = await Promise.all([
  readFile("./package.json"),
  readFile("./packages/connect/package.json"),
]).then((pkgs) => pkgs.map((rawPkg) => JSON.parse(rawPkg)))

const rootVersion = rootPkg.resolutions?.["@substrate/connect"]
const connectVersion = connectPkg.version

const isMismatch = rootVersion !== connectVersion

if (isMismatch) {
  console.error(
    "The @substrate/connect resolution on the root package.json does not match the version of packages/connect/package.json",
  )
}

process.exit(isMismatch ? 1 : 0)
