import type {
  Injected,
  InjectedAccount,
} from "@polkadot/extension-inject/types"
import type { LightClientProvider } from "@substrate/light-client-extension-helpers/web-page"
import type { BackgroundRpcSpec } from "../background/types"

type PjsInjectOpts = {
  name: string
  version: string
  rpc: BackgroundRpcSpec
  lightClientProviderPromise: Promise<LightClientProvider>
}
export const pjsInject = ({
  name,
  version,
  rpc,
  lightClientProviderPromise,
}: PjsInjectOpts) =>
  injectExtension(
    async (_origin) => {
      // TODO: validate allowed origin
      const lightClientProvider = await lightClientProviderPromise
      let requestId = 0
      return {
        accounts: {
          // TODO: use anyType
          async get(_anyType) {
            return (
              await Promise.all(
                Object.values(lightClientProvider.getChains()).map(
                  async ({ genesisHash }) =>
                    [genesisHash, await rpc.getAccounts(genesisHash)] as const,
                ),
              )
            ).flatMap(([genesisHash, accounts]) =>
              accounts.map(
                ({ address }) =>
                  ({
                    type: "sr25519",
                    address,
                    genesisHash,
                  }) as InjectedAccount,
              ),
            )
          },
          subscribe(_cb) {
            // TODO: implement
            return () => {}
          },
        },
        signer: {
          async signPayload(payload) {
            return {
              id: requestId++,
              signature: (await rpc.pjsSignPayload(payload)) as `0x{string}`,
            }
          },
        },
      }
    },
    { name, version },
  )

const injectExtension = (
  enable: (origin: string) => Promise<Injected>,
  { name, version }: { name: string; version: string },
) => {
  const windowInject = window
  // @ts-expect-error
  windowInject.injectedWeb3 = windowInject.injectedWeb3 || {}

  // @ts-expect-error
  windowInject.injectedWeb3[name] = {
    enable,
    version,
  }
}
