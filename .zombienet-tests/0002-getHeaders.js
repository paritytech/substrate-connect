const polkadotApi = require("@polkadot/api")

async function connect(customChainSpec, types) {
  const substrateConnect = await import("@substrate/connect")
  const provider = new substrateConnect.ScProvider(customChainSpec)
  const api = new polkadotApi.ApiPromise({ provider, types })
  return api
}

async function run(nodeName, networkInfo) {
  const { userDefinedTypes } = networkInfo.nodesByName[nodeName]
  const customChainSpec = require(networkInfo.chainSpecPath)

  const api = await connect(JSON.stringify(customChainSpec), userDefinedTypes)
  // add 30s sleep to give time to sync
  await new Promise((resolve) => setTimeout(resolve, 20000))

  let count = 0
  await new Promise(async (resolve, reject) => {
    const unsub = await api.rpc.chain.subscribeNewHeads((header) => {
      console.log(`#${header.number}:`, header.number)
      console.log("count", count)
      if (++count === 2) {
        console.log("2 headers retrieved, unsubscribing")
        unsub()
        resolve()
      }
    })
  })

  return count
}

module.exports = { run }
