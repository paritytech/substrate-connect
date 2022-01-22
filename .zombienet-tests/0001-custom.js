const polkadotApi = require("@polkadot/api")

async function connect(customChainSpec, types) {
  const substrateConnect = await import("@substrate/connect")
  const provider = new substrateConnect.ScProvider(customChainSpec)
  const api = new polkadotApi.ApiPromise({ provider, types })
  await api.isReady
  return api
}

async function run(nodeName, networkInfo) {
  const { userDefinedTypes } = networkInfo.nodesByName[nodeName]
  const customChainSpec = require(networkInfo.chainSpecPath)

  // TODO: forkId generate an error in smoldot-light
  delete customChainSpec.forkId

  const api = await connect(JSON.stringify(customChainSpec), userDefinedTypes)
  // add 30s sleep to give time to sync
  await new Promise((resolve) => setTimeout(resolve, 30000))

  let count = 0
  const unsub = await api.rpc.chain.subscribeNewHeads((header) => {
    console.log(`#${header.number}:`, header)

    if (++count === 2) {
      console.log("2 headers retrieved, unsubscribing")
      unsub()
    }
  })

  return count
}

module.exports = { run }
