import { type ReactNode, createContext, useContext, useState } from "react"
import type {
  UnstableWallet,
  UnstableWalletProviderDiscovery,
} from "@substrate/unstable-wallet-provider"
import useSWR from "swr"
import { getProviders } from "../api"

type Context = {
  providerDetails?: UnstableWalletProviderDiscovery.Detail[]
  providerDetail?: UnstableWalletProviderDiscovery.Detail
  connectProviderDetail(detail: UnstableWalletProviderDiscovery.Detail): void
  disconnectProviderDetail(): void
  // FIXME: accounts is chain specific
  accounts?: UnstableWallet.Account[]
  account?: UnstableWallet.Account
  connectAccount(account: UnstableWallet.Account): void
  disconnectAccount(): void
  provider?: UnstableWallet.Provider
  chainId: string
}

const UnstableProvider = createContext<Context>(null!)

/* eslint-disable react-refresh/only-export-components */
export const useUnstableProvider = () => useContext(UnstableProvider)

export const UnstableProviderProvider = ({
  children,
  chainId,
}: {
  children: ReactNode
  chainId: string
}) => {
  const { data: providerDetails } = useSWR("getProviders", getProviders)
  const [providerDetail, setProviderDetail] =
    useState<UnstableWalletProviderDiscovery.Detail>()
  const { data: provider } = useSWR(
    () => `providerDetail.${providerDetail!.info.uuid}.provider`,
    () => providerDetail!.provider,
  )
  const { data: accounts } = useSWR(
    () =>
      `providerDetail.${providerDetail!.info.uuid}.provider.getAccounts(${chainId})`,
    async () => (await providerDetail!.provider).getAccounts(chainId),
  )
  const [account, setAccount] = useState<UnstableWallet.Account>()
  const disconnectAccount = () => setAccount(undefined)
  const disconnectProviderDetail = () => {
    disconnectAccount()
    setProviderDetail(undefined)
  }

  return (
    <UnstableProvider.Provider
      value={{
        providerDetails,
        providerDetail,
        connectProviderDetail: setProviderDetail,
        disconnectProviderDetail,
        accounts,
        account,
        connectAccount: setAccount,
        disconnectAccount,
        provider,
        chainId,
      }}
    >
      {children}
    </UnstableProvider.Provider>
  )
}
