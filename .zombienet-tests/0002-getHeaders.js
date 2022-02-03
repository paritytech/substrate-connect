const { connect } = require("./utils")

async function run(nodeName, networkInfo) {
  const api = await connect(nodeName, networkInfo)
  // add 20s sleep to give time to sync
  await new Promise((resolve) => setTimeout(resolve, 10000))
  let count = 0
  try {
    await new Promise(async (resolve, reject) => {
      const unsub = await api.rpc.chain.subscribeNewHeads((header) => {
        if (++count === 2) {
          unsub()
          resolve()
        }
      })
    })
  } catch (error) {
    // DEBUG
    console.log("error", error)
  }

  return count
}

module.exports = { run }
