import { getObservableClient } from "@polkadot-api/client"
import { getViewBuilder } from "@polkadot-api/metadata-builders"
import { createClient } from "@polkadot-api/substrate-client"
import { helper } from "@substrate/light-client-extension-helpers/extension-page"
import { filter, firstValueFrom } from "rxjs"

export const decodeCallData = async (chainId: string, callData: string) => {
  const chains = await helper.getChains()
  const chain = chains.find(({ genesisHash }) => genesisHash === chainId)
  if (!chain) throw new Error("unkonwn chain")
  const client = getObservableClient(createClient(chain.provider))
  const { metadata$, unfollow } = client.chainHead$()
  const metadata = await firstValueFrom(metadata$.pipe(filter(Boolean)))
  unfollow()
  client.destroy()
  return getViewBuilder(metadata).callDecoder(callData)
}
