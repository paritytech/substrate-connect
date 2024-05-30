# @substrate/discovery

This package implements the discovery protocol that browsers use to find compliant browser extensions.

The main export is a function called `getProviders`. This function dispatches an event on the window object
that compliant browser extensions (or similar) may respond to by providing back an interface of the
correct shape. An array of all such interfaces that we get back will be given back to the caller of
getProviders.

## React Example

```ts
import useSWR from "swr"
import { getProviders, ProviderDetail } from "@substrate/discovery"

const { data: providerDetails } = useSWR("getProviders", getProviders)
const [providerDetail, setProviderDetail] = useState<ProviderDetail>()
const { data: provider } = useSWR(
  () => `providerDetail.${providerDetail!.info.uuid}.provider`,
  () => providerDetail!.provider,
)
```

## Extension Example

```ts
import { getLightClientProvider } from "@substrate/light-client-extension-helpers/web-page"

const rpc = createRpc(
  (msg: any) =>
    window.postMessage({ msg, origin: "substrate-wallet-template/web" }),
  handlers,
).withClient<BackgroundRpcSpec>()
window.addEventListener("message", ({ data }) => {
  if (data?.origin !== "substrate-wallet-template/extension") return
  rpc.handle(data.msg, undefined)
})

const provider = await getLightClientProvider(CHANNEL_ID).then(
  (lightClientProvider) => ({
    ...lightClientProvider,
    async getAccounts(chainId: string) {
      return rpc.client.getAccounts(chainId)
    },
    async createTx(chainId: string, from: string, callData: string) {
      return rpc.client.createTx(chainId, from, callData)
    },
  }),
)

window.addEventListener(
  "unstableWallet:requestProvider",
  ({ detail: { onProvider } }) => onProvider(detail),
)

window.dispatchEvent(
  new CustomEvent("unstableWallet:announceProvider", {
    detail,
  }),
)
```
