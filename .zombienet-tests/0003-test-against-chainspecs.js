const { connect } = require("./utils")

async function run(nodeName) {
  let name = nodeName != "rococo" ? nodeName : "rococo_v2_2"
  console.log("name", name)
  let networkInfo = {
    test: {
      userDefinedTypes: [],
    },
    chainSpecPath: `../packages/connect/src/connector/specs/${name}.json`,
  }

  const api = await connect("light-client", networkInfo)
  let count = 0
  await new Promise(async (resolve, reject) => {
    const unsub = await api.rpc.chain.subscribeNewHeads((header) => {
      console.log(" - ", header.toHuman())
      if (++count === 2) {
        unsub()
        resolve()
      }
    })
  })
  return count
}

module.exports = { run }
