import "regenerator-runtime/runtime"
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
      const westendProvider = new ScProvider(Sc, Sc.WellKnownChain.westend2)
      const kusamaProvider = new ScProvider(Sc, Sc.WellKnownChain.ksmcc3)
      const polkadotProvider = new ScProvider(Sc, Sc.WellKnownChain.polkadot)
      await Promise.all(
        [westendProvider, kusamaProvider, polkadotProvider].map((p) =>
          p.connect(),
        ),
      )
      const westend = await ApiPromise.create({ provider: westendProvider })
      const kusama = await ApiPromise.create({ provider: kusamaProvider })
      const polkadot = await ApiPromise.create({ provider: polkadotProvider })

      const westendFnc = async () => {
        const westendUI = document.getElementById("westend")
        const westendHead = await westend.rpc.chain.getHeader()
        if (westendUI) {
          westendUI.innerText = westendHead?.number.toString()
          await westend.rpc.chain.subscribeNewHeads(
            (lastHeader: { number: { toString: () => string } }) => {
              westendUI.innerText = "#" + lastHeader?.number.toString()
            },
          )
        }
      }

      const kusamaFnc = async () => {
        const kusamaUI = document.getElementById("kusama")
        const kusamaHead = await kusama.rpc.chain.getHeader()
        if (kusamaUI) {
          kusamaUI.innerText = kusamaHead?.number.toString()
          await kusama.rpc.chain.subscribeNewHeads((lastHeader) => {
            kusamaUI.innerText = "#" + lastHeader?.number.toString()
          })
        }
      }

      const polkadotFnc = async () => {
        const polkadotUI = document.getElementById("polkadot")
        const polkadotHead = await polkadot.rpc.chain.getHeader()
        if (polkadotUI) {
          polkadotUI.innerText = polkadotHead?.number.toString()
          await polkadot.rpc.chain.subscribeNewHeads((lastHeader) => {
            polkadotUI.innerText = "#" + lastHeader?.number.toString()
          })
        }
      }

      await Promise.all([westendFnc(), kusamaFnc(), polkadotFnc()])

      const westmintProvider = new ScProvider(
        Sc,
        JSON.stringify(westmint),
        westendProvider,
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
