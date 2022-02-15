const polkadotApi = require("@polkadot/api")

async function connect(nodeName, networkInfo) {
  const { userDefinedTypes } = networkInfo.nodesByName[nodeName]
  const customChainSpec = require(networkInfo.chainSpecPath)
  const { createScClient } = await import("@substrate/connect")
  const scClient = createScClient()
  const provider = scClient.addChain(JSON.stringify(customChainSpec))
  const api = new polkadotApi.ApiPromise({ provider, types: userDefinedTypes })
  return api
}

module.exports = { connect }
