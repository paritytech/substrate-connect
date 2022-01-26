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

  // TODO: forkId generate an error in smoldot-light
  delete customChainSpec.forkId

  const api = await connect(JSON.stringify(customChainSpec), userDefinedTypes)
  // add 30s sleep to give time to sync
  await new Promise((resolve) => setTimeout(resolve, 30000))
  const lastHdr = await api.rpc.chain.getHeader()
  console.log("lastHdr", lastHdr.hash.toHuman(), lastHdr.parentHash.toHuman())
  const decimals = api.registry.chainDecimals

  return decimals[0]

  // let count = 0
  // await new Promise(async (resolve, reject) => {
  //   const unsub = await api.rpc.chain.subscribeNewHeads((header) => {
  //     console.log(`#${header.number}:`, header)

  //     if (++count === 2) {
  //       console.log("2 headers retrieved, unsubscribing")
  //       unsub()
  //       resolve()
  //     }
  //   })
  // })

  // return count
}

module.exports = { run }
