import * as environment from "../environment"
import { loadWellKnownChains } from "./loadWellKnownChains"
import { ClientService } from "./ClientService"

export const updateDatabases = async (client: ClientService) => {
  const wellKnownChains = await loadWellKnownChains()
  // FIXME: improve error reporting
  wellKnownChains.forEach(async (chainSpec, chainName) => {
    // FIXME: use substrate-client
    const chain = await client.addChain({
      chainSpec,
      databaseContent: await environment.get({
        type: "database",
        chainName,
      }),
    })
    const channel = chain.channel("db", (rawMessage) => {
      const message = JSON.parse(rawMessage)
      if (message?.params?.result?.event === "initialized") {
        channel.sendJsonRpc(
          JSON.stringify({
            jsonrpc: "2.0",
            id: "1",
            method: "chainHead_unstable_finalizedDatabase",
            params: [
              // TODO: calculate this better
              chrome.storage.local.QUOTA_BYTES / wellKnownChains.size,
            ],
          }),
        )
      } else if (message?.id === "1") {
        environment
          .set({ type: "database", chainName }, message.result)
          .then(() => console.log(`Updated ${chainName} database.`))
          .finally(() => {
            channel.remove()
            chain.remove()
          })
      }
    })

    channel.sendJsonRpc(
      JSON.stringify({
        jsonrpc: "2.0",
        id: "0",
        method: "chainHead_unstable_follow",
        params: [true],
      }),
    )
  })
}
