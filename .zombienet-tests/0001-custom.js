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
  const validator = await api.query.session.validators()
  console.log("validators", validator)
  return validator.length
}

module.exports = { run }
