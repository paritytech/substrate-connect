/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import "regenerator-runtime/runtime"
import { createScClient, WellKnownChains } from "@substrate/connect"
import { ApiPromise } from "@polkadot/api"
import westmint from "./assets/westend-westmint.json"
import UI, { emojis } from "./view"

window.onload = () => {
  const loadTime = performance.now()
  const ui = new UI({ containerId: "messages" }, { loadTime })
  ui.showSyncing()
  void (async () => {
    try {
      const scClient = createScClient()
      await scClient.addWellKnownChain(WellKnownChains.westend2);
      const westmintProvider = await scClient.addChain(JSON.stringify(westmint));
      const api = await ApiPromise.create({ provider: westmintProvider });
      
      const [chain, nodeName, nodeVersion, properties] = await Promise.all([
        api.rpc.system.chain(),
        api.rpc.system.name(),
        api.rpc.system.version(),
        api.rpc.system.properties(),
      ])
      const header = await api.rpc.chain.getHeader()
      const chainName = await api.rpc.system.chain()

      // Show chain constants - from chain spec
      ui.log(
        `${emojis.seedling} Light client ready - Using ${chain} - ${nodeName}: ${nodeVersion}`,
        true,
      )
      ui.log(
        `${emojis.info} Connected to ${chainName}: syncing will start at block #${header.number}`,
      )
      ui.log(
        `${emojis.chequeredFlag} Token decimals: ${properties["tokenDecimals"]} - symbol: ${properties["tokenSymbol"]}`,
      )
      ui.log(
        `${emojis.chequeredFlag} Genesis hash is ${api.genesisHash.toHex()}`,
      )

      // Show how many peers we are syncing with
      const health = await api.rpc.system.health()
      const peers =
        health.peers.toNumber() === 1 ? "1 peer" : `${health.peers} peers`
      ui.log(`${emojis.stethoscope} Chain is syncing with ${peers}`)

      // Check the state of syncing every 2s and update the syncing state message
      //
      // Resolves the first time the chain is fully synced so we can wait before
      // adding subscriptions. Carries on pinging to keep the UI consistent
      // in case syncing stops or starts.
      const wait = (ms: number) =>
        new Promise<void>((res) => {
          setTimeout(res, ms)
        })
      const waitForChainToSync = async () => {
        const health = await api.rpc.system.health()
        if (health.isSyncing.eq(false)) {
          ui.showSynced()
        } else {
          ui.showSyncing()
          await wait(2000)
          await waitForChainToSync()
        }
      }

      await waitForChainToSync()
      ui.log(`${emojis.newspaper} Receiving first 10 tokens:`)
      for (let i = 0; i <= 9; i++) {
        await api.query.assets.asset(i).then((asset) => {
          if (asset.isNone) return
          ui.log(`${emojis.banknote} ------------------- Asset No.${i + 1}:`)
          const { owner, issuer, admin, supply, isFrozen } = JSON.parse(
            asset as unknown as string,
          )
          ui.log(`${emojis.info} Owner: ${owner}`)
          ui.log(`${emojis.info} Issuer: ${issuer}`)
          ui.log(`${emojis.info} Admin: ${admin}`)
          ui.log(`${emojis.info} Supply:${supply}`)
          ui.log(`${emojis.info} Asset is ${!isFrozen && `not `} Frozen`)
        })
      }
    } catch (error) {
      ui.error(<Error>error)
    }
  })()
}
