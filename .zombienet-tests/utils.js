const { ApiPromise } = require("@polkadot/api")

async function connect(nodeName, networkInfo, parachainId) {
  const { userDefinedTypes } = networkInfo.nodesByName[nodeName]
  const customChainSpec = require(networkInfo.chainSpecPath)
  const { createPolkadotJsScClient } = await import("@substrate/connect")
  const scClient = createPolkadotJsScClient()
  let provider
  if (parachainId) {
    await scClient.addChain(JSON.stringify(customChainSpec))
    const customParachainSpec = require(networkInfo?.paras[parachainId]?.chainSpecPath)
    provider = await scClient.addChain(JSON.stringify(customParachainSpec))
  } else {
    provider = await scClient.addChain(JSON.stringify(customChainSpec))
  }
  const api = await ApiPromise.create({ provider, types: userDefinedTypes })
  return api
}

module.exports = { connect }
