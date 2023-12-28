import {
  LightClientProvider,
  RawChain,
  getLightClientProvider,
} from "@polkadot-api/light-client-extension-helpers/web-page"
import { DOM_ELEMENT_ID } from "@substrate/connect-extension-protocol"
import type { BackgroundRpcHandlers } from "../background"
import { createRpc } from "../shared/createRpc"
import { Chain, PolkadotProvider } from "./types"
;(async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000))
  const provider = await getLightClientProvider(DOM_ELEMENT_ID)
  const client = createRpc<BackgroundRpcHandlers>((rpc) =>
    window.postMessage({ rpc }),
  )

  window.addEventListener("message", async ({ data, source, origin }) => {
    // FIXME: check source/origin/channelId
    if (!data.rpcResponse) return
    client.handle(data.rpcResponse)
  })

  const polkadotProvider: PolkadotProvider = withAccounts(provider, client)
  console.log(
    "rpcClient.getAccounts",
    await client.call("getAccounts", ["polkadot"]),
  )

  console.log(
    "polkadotProvider chain getAccounts()",
    await Object.values(await polkadotProvider.getChains())[0].getAccounts(),
  )
})()

type RpcClient = ReturnType<typeof createRpc<BackgroundRpcHandlers>>

function withAccounts(
  provider: LightClientProvider,
  client: RpcClient,
): PolkadotProvider {
  const withNetworkAccounts = (rawChain: RawChain): Chain => {
    return {
      genesisHash: rawChain.genesisHash,
      name: rawChain.name,
      getAccounts() {
        return client.call("getAccounts", [rawChain.genesisHash])
      },
      onAccountsChange(cb) {
        throw new NotImplementedError()
      },
      async connect(onMessage) {
        return {
          provider: rawChain.connect(onMessage),
          createTx(from, callData) {
            return client.call("createTx", [
              rawChain.genesisHash,
              from,
              callData,
            ])
          },
        }
      },
    }
  }
  return {
    async getChain(chainspec, relayChainGenesisHash) {
      return withNetworkAccounts(
        await provider.getChain(chainspec, relayChainGenesisHash),
      )
    },
    async getChains() {
      return Object.fromEntries(
        Object.entries(await provider.getChains()).map(
          ([genesisHash, rawChain]: [string, RawChain]) => [
            genesisHash,
            withNetworkAccounts(rawChain),
          ],
        ),
      )
    },
    onChainsChange(cb) {
      return provider.addChainsChangeListener((rawChains) =>
        cb(
          Object.fromEntries(
            Object.entries(rawChains).map(
              ([genesisHash, rawChain]: [string, RawChain]) => [
                genesisHash,
                withNetworkAccounts(rawChain),
              ],
            ),
          ),
        ),
      )
    },
  }
}

class NotImplementedError extends Error {
  constructor() {
    super("not implemented")
  }
}
