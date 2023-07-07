const { connect } = require("./utils")

async function run(nodeName, networkInfo) {
  const api = await connect(nodeName, networkInfo, "100")
  let count = 0
  await new Promise(async (resolve, reject) => {
    const unsub = await api.rpc.chain.subscribeNewHeads((header) => {
      if (++count === 2) {
        unsub()
        resolve()
      }
    })
  })
  return count
}

module.exports = { run }
