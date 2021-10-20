/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import "regenerator-runtime/runtime"
import { Detector } from "@substrate/connect"

window.onload = () => {
  void (async () => {
    try {
      const detect = new Detector("Multiple Network Demo")

      const westend = async () => {
        const westend = await detect.connect("westend")
        const westendUI = document.getElementById("westend")
        const westendHead = await westend.rpc.chain.getHeader()
        if (westendUI) {
          westendUI.innerText = westendHead?.number.toString()
          await westend.rpc.chain.subscribeNewHeads((lastHeader) => {
            westendUI.innerText = lastHeader?.number.toString()
          })
        }
      }

      const kusama = async () => {
        const kusama = await detect.connect("kusama")
        const kusamaUI = document.getElementById("kusama")
        const kusamaHead = await kusama.rpc.chain.getHeader()
        if (kusamaUI) {
          kusamaUI.innerText = kusamaHead?.number.toString()
          await kusama.rpc.chain.subscribeNewHeads((lastHeader) => {
            kusamaUI.innerText = lastHeader?.number.toString()
          })
        }
      }

      const polkadot = async () => {
        const polkadot = await detect.connect("polkadot")
        const polkadotUI = document.getElementById("polkadot")
        const polkadotHead = await polkadot.rpc.chain.getHeader()
        if (polkadotUI) {
          polkadotUI.innerText = polkadotHead?.number.toString()
          await polkadot.rpc.chain.subscribeNewHeads((lastHeader) => {
            polkadotUI.innerText = lastHeader?.number.toString()
          })
        }
      }

      const rococo = async () => {
        const rococo = await detect.connect("rococo")
        const rococoUI = document.getElementById("rococo")
        const rococoHead = await rococo.rpc.chain.getHeader()
        if (rococoUI) {
          rococoUI.innerText = rococoHead?.number.toString()
          await rococo.rpc.chain.subscribeNewHeads((lastHeader) => {
            rococoUI.innerText = lastHeader?.number.toString()
          })
        }
      }

      await Promise.all([westend(), kusama(), polkadot(), rococo()])
    } catch (error) {
      console.error(error)
    }
  })()
}
