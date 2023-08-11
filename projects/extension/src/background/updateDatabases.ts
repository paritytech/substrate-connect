import { start as smoldotStart } from "smoldot"

import * as environment from "../environment"
import { loadWellKnownChains } from "./loadWellKnownChains"

export const updateDatabases = async () => {
  const wellKnownChains = await loadWellKnownChains()
  const client = smoldotStart({
    cpuRateLimit: 0.5, // Politely limit the CPU usage of the smoldot background worker.
  })

  let promises = []

  for (const [key, value] of wellKnownChains) {
    let databaseContent = await environment.get({
      type: "database",
      chainName: key,
    })

    promises.push(
      new Promise<void>((resolve) => {
        client
          .addChain({ chainSpec: value, databaseContent })
          .then(async (chain) => {
            chain.sendJsonRpc(
              `{"jsonrpc":"2.0","id":"1","method":"chainHead_unstable_follow","params":[true]}`,
            )

            while (true) {
              const response = JSON.parse(await chain.nextJsonRpcResponse())
              if (response?.params?.result?.event === "initialized") {
                chain.sendJsonRpc(
                  JSON.stringify({
                    jsonrpc: "2.0",
                    id: "2",
                    method: "chainHead_unstable_finalizedDatabase",
                    params: [
                      // TODO: calculate this better
                      chrome.storage.local.QUOTA_BYTES / wellKnownChains.size,
                    ],
                  }),
                )
              }
              if (response?.id === "2") {
                await environment.set(
                  { type: "database", chainName: key },
                  response.result,
                )
                resolve()
                break
              }
            }
          })
      }),
    )
  }

  try {
    await Promise.all(promises)
    console.log("All databases are updated. Light Client is terminated.")
  } catch (error) {
    console.error(`Error occurred during database update: ${error}`)
  } finally {
    client.terminate()
  }
}
