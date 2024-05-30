import type {
  Injected,
  InjectedAccount,
} from "@polkadot/extension-inject/types"
import type { Account, BackgroundRpcSpec } from "../background/types"
import type { UnstableWallet } from "@substrate/unstable-wallet-provider"

type PjsInjectOpts = {
  name: string
  version: string
  rpc: BackgroundRpcSpec
  provider: UnstableWallet.Provider
  subscribeOnAccountsChanged: (cb: (accounts: Account[]) => void) => () => void
}
export const pjsInject = ({
  name,
  version,
  rpc,
  provider,
  subscribeOnAccountsChanged,
}: PjsInjectOpts) =>
  injectExtension(
    async (_origin) => {
      // TODO: validate allowed origin
      let requestId = 0
      return {
        accounts: {
          // TODO: use anyType
          async get(_anyType) {
            return (
              await Promise.all(
                Object.values(provider.getChains()).map(
                  async ({ genesisHash }) =>
                    [genesisHash, await rpc.getAccounts(genesisHash)] as const,
                ),
              )
            ).flatMap(([genesisHash, accounts]) =>
              accounts.map(
                ({ address }) =>
                  ({
                    address,
                    genesisHash,
                  }) as InjectedAccount,
              ),
            )
          },
          subscribe: subscribeOnAccountsChanged,
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
