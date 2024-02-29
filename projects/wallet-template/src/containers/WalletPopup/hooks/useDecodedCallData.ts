import { helper } from "@substrate/light-client-extension-helpers/extension-page"
import { getObservableClient } from "@polkadot-api/client"
import { createClient } from "@polkadot-api/substrate-client"
import { DecodedCall, getViewBuilder } from "@polkadot-api/metadata-builders"
import { useEffect, useState } from "react"
import { filter, firstValueFrom } from "rxjs"
import { useIsMounted } from "../../../hooks/useIsMounted"

export const useDecodedCallData = (chainId: string, callData: string) => {
  const [decodedCallData, setDecodedCallData] = useState<DecodedCall>()
  const isMounted = useIsMounted()

  useEffect(() => {
    if (!chainId || !callData) return
    helper.getChains().then(async (chains) => {
      const chain = chains.find(({ genesisHash }) => genesisHash === chainId)
      if (!chain) return
      const client = getObservableClient(createClient(chain.provider))
      const { metadata$, unfollow } = client.chainHead$()
      const metadata = await firstValueFrom(metadata$.pipe(filter(Boolean)))
      unfollow()
      client.destroy()
      const builder = getViewBuilder(metadata)
      if (!isMounted()) return
      setDecodedCallData(builder.callDecoder(callData))
    })
  }, [chainId, callData, isMounted])

  return { decodedCallData }
}
