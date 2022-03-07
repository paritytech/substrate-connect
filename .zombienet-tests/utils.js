const { ApiPromise } = require("@polkadot/api")

async function connect(nodeName, networkInfo, isParachain) {
  const { userDefinedTypes } = networkInfo.nodesByName[nodeName]
  const customChainSpec = require(networkInfo.chainSpecPath)
  const { createPolkadotJsScClient, WellKnownChain } = await import(
    "@substrate/connect"
  )
  const scClient = createPolkadotJsScClient()
  let provider
  if (isParachain) {
    await scClient.addChain(WellKnownChain.rococo_v2)
    const customParachainSpec = require(networkInfo?.paras[100]?.spec)
    provider = await scClient.addChain(JSON.stringify(customParachainSpec))
  } else {
    provider = await scClient.addChain(JSON.stringify(customChainSpec))
  }
  const api = await ApiPromise.create({ provider, types: userDefinedTypes })
  return api
}

module.exports = { connect }
