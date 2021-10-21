const fs = require("fs")
const path = require("path")
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

networks.forEach((network) => {
  const wsPathFile = `${workspacePath}/${network}.json`
  const chainDirFile = `${chainDir}/${network}.json`
  if (!fs.existsSync(wsPathFile)) {
    console.log(`File ${wsPathFile} does not exist. Copying...`)
    fs.copyFile(`${chainDir}/${network}.json`, wsPathFile, (err) => {
      if (err) throw err
    })
  } else {
    // file exists - we should check if IDs are same
    fs.readFile(wsPathFile, function (err, data) {
      if (err) console.log(err)
      const dirFile = JSON.parse(data).id
      fs.readFile(chainDirFile, function (err, data) {
        if (err) console.log(err)
        if (JSON.parse(data).id !== dirFile) {
          fs.copyFile(chainDirFile, wsPathFile, (err) => {
            if (err) throw err
          })
        }
      })
    })
  }
})
