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

  // return count
  const lastHdr = await api.rpc.chain.getHeader()
  console.log("lastHdr", lastHdr.hash.toHuman(), lastHdr.parentHash.toHuman())
  const decimals = api.registry.chainDecimals

  console.log(decimals)
  return decimals[0]
}

module.exports = { run }
