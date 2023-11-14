import { ApiPromise } from "@polkadot/api"
import { ScProvider } from "@polkadot/rpc-provider/substrate-connect"
import * as Sc from "@substrate/connect"
import westmint from "./assets/westend-westmint.json"
import UI, { emojis } from "./view"

window.onload = () => {
  const loadTime = performance.now()
  const ui = new UI({ containerId: "messages" }, { loadTime })
  ui.showSyncing()
  void (async () => {
    try {
      ;(
        [
          [Sc.WellKnownChain.polkadot, "polkadot"],
          [Sc.WellKnownChain.ksmcc3, "kusama"],
          [Sc.WellKnownChain.westend2, "westend"],
        ] as [spec: string, elementId: string][]
      ).forEach(([spec, elementId]) => subscribeChainNewHeads(spec, elementId))

      const westmintProvider = new ScProvider(
        Sc,
        JSON.stringify(westmint),
        new ScProvider(Sc, Sc.WellKnownChain.westend2),
      )
      await westmintProvider.connect()
      const api = await ApiPromise.create({ provider: westmintProvider })

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
      ui.log(`${emojis.stethoscope} Parachain is syncing with ${peers}`)

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
    } catch (error) {
      ui.error(error as Error)
    }
  })()
}

async function subscribeChainNewHeads(spec: string, elementId: string) {
  const provider = new ScProvider(Sc, spec)
  await provider.connect()
  const api = await ApiPromise.create({ provider })
  const ui = document.getElementById(elementId)
  if (!ui) return
  const header = await api.rpc.chain.getHeader()
  ui.innerText = `#${header?.number.toString()}`
  await api.rpc.chain.subscribeNewHeads(
    (lastHeader: { number: { toString: () => string } }) => {
      ui.innerText = `#${lastHeader?.number.toString()}`
    },
  )
}
