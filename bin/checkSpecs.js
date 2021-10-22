const promisify = require("util").promisify
const fs = require("fs")
const path = require("path")

const readFile = promisify(fs.readFile)
const copyFile = promisify(fs.copyFile)

const networks = [
  "polkadot",
  "kusama",
  "westend",
  "rococo", //, 'tick', 'track', 'trick'
]

const chainDir = "../../.chains"

const paths = {
  connect: "src/specs",
  extension: "public/assets",
}

// Identify where the script is called from (can be either "extension" or "connect")
const workspace = path.resolve().split("/").pop()
const workspacePath = `${path.resolve()}/${paths[workspace]}`
const pathExist = fs.existsSync(workspacePath)

// check if path exist. If not create it
if (!pathExist) fs.mkdirSync(workspacePath)

async function getIdFromFile(fileName) {
  const data = await readFile(fileName, "utf-8")
  return JSON.parse(data).id
}

async function ensureLatest(newest, current) {
  const name = current.split("/").pop()
  if (!fs.existsSync(current)) {
    console.log(`File ${name} does not exist. Copying...`)
    await copyFile(newest, current)
  }

  const [newId, currentId] = await Promise.all(
    [newest, current].map(getIdFromFile),
  )

  if (newId !== currentId) {
    console.log(`Newer version found for ${name}. Replacing...`)
    await copyFile(newest, current)
  }
}

void Promise.all(
  networks.map((network) => {
    const wsPathFile = `${workspacePath}/${network}.json`
    const chainDirFile = `${chainDir}/${network}.json`
    return ensureLatest(chainDirFile, wsPathFile).catch((err) => {
      console.log("There was an error ensuring the latest version")
      console.error(err)
    })
  }),
)
