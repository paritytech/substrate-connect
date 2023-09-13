const Sc = require("@substrate/connect")
const { ApiPromise } = require("@polkadot/api")

async function connect(nodeName, networkInfo, parachainId) {
  let userDTypes
  if (nodeName === "light-client") {
    console.log("light client")
    userDTypes = []
  } else {
    const { userDefinedTypes } = networkInfo.nodesByName[nodeName]
    userDTypes = userDefinedTypes
  }

  const customChainSpec = require(networkInfo.chainSpecPath)
  const { ScProvider } = await import(
    "@polkadot/rpc-provider/substrate-connect"
  )
  let provider
  if (parachainId) {
    const relayProvider = new ScProvider(Sc, JSON.stringify(customChainSpec))
    const customParachainSpec = require(
      networkInfo?.paras[parachainId]?.chainSpecPath,
    )
    provider = new ScProvider(
      Sc,
      JSON.stringify(customParachainSpec),
      relayProvider,
    )
  } else {
    provider = new ScProvider(Sc, JSON.stringify(customChainSpec))
  }
  await provider.connect()
  return ApiPromise.create({ provider, types: userDTypes })
}

module.exports = { connect }
