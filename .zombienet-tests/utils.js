const { ApiPromise } = require("@polkadot/api")

async function connect(nodeName, networkInfo) {
  const { userDefinedTypes } = networkInfo.nodesByName[nodeName]
  const customChainSpec = require(networkInfo.chainSpecPath)
  const { createPolkadotJsScClient, WellKnownChain } = await import(
    "@substrate/connect"
  )
  const scClient = createPolkadotJsScClient()
  const provider = await scClient.addChain(JSON.stringify(customChainSpec))
  const api = await ApiPromise.create({ provider, types: userDefinedTypes })
  return api
}

module.exports = { connect }
