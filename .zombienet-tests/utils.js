const { ApiPromise } = require("@polkadot/api")

async function connect(nodeName, networkInfo, parachainId) {
  const { userDefinedTypes } = networkInfo.nodesByName[nodeName]
  const customChainSpec = require(networkInfo.chainSpecPath)
  const { ScProvider } = await import(
    "@polkadot/rpc-provider/substrate-connect"
  )
  let provider
  if (parachainId) {
    const relayProvider = new ScProvider(JSON.stringify(customChainSpec))
    const customParachainSpec = require(networkInfo?.paras[parachainId]
      ?.chainSpecPath)
    provider = new ScProvider(
      JSON.stringify(customParachainSpec),
      relayProvider,
    )
  } else {
    provider = new ScProvider(JSON.stringify(customChainSpec))
  }
  await provider.connect()
  return ApiPromise.create({ provider, types: userDefinedTypes })
}

module.exports = { connect }
