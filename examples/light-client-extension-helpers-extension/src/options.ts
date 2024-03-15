import { helper } from "@substrate/light-client-extension-helpers/extension-page"
import * as westend from "./test-data/westend"
import * as kusama from "./test-data/kusama"
import { createClient } from "@polkadot-api/substrate-client"
;(async () => {
  console.log({ getChain: await helper.getChains() })
  console.log({ persistChain: await helper.persistChain(westend.chainSpec) })
  console.log({ getChain: await helper.getChains() })
  console.log({ disconnect: await helper.disconnect(123, westend.genesisHash) })

  console.log({ persistChain: await helper.persistChain(kusama.chainSpec) })
  console.log({
    setBootNodes: await helper.setBootNodes(kusama.genesisHash, [
      "fake-bootnode",
    ]),
  })
  console.log({ getChain: await helper.getChains() })
  console.log({
    setBootNodes: await helper.setBootNodes(kusama.genesisHash, []),
  })
  console.log({ getChain: await helper.getChains() })
  await new Promise((res) => setTimeout(res, 2000))
  console.log({ deleteChain: await helper.deleteChain(kusama.genesisHash) })
  console.log({ getChains: await helper.getChains() })
})()

setInterval(async () => {
  console.log({ getActiveConnections: await helper.getActiveConnections() })
}, 5000)
;(async () => {
  const [chain] = await helper.getChains()
  if (!chain) {
    return
  }

  const client = createClient(chain.provider)

  let count = 0
  const follower = client.chainHead(
    true,
    (event) => {
      if (count === 5) {
        follower.unfollow()
        client.destroy()
      }
      console.log(`${chain.name} chainHead event#${count++}`, event)
    },
    (error) => console.error(error),
  )
})()
