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
  await new Promise((resolve) => setTimeout(resolve, 30000))
  const decimals = api.registry.chainDecimals

  return decimals[0]
}

module.exports = { run }
