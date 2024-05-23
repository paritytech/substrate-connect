import { type ReactNode, createContext, useContext, useState } from "react"
import useSWR from "swr"
import * as SubstrateDiscovery from "@substrate/discovery"

type Context = {
  providerDetails?: SubstrateDiscovery.ProviderDetail[]
  providerDetail?: SubstrateDiscovery.ProviderDetail
  connectProviderDetail(detail: SubstrateDiscovery.ProviderDetail): void
  disconnectProviderDetail(): void
  // FIXME: accounts is chain specific
  accounts?: SubstrateDiscovery.Account[]
  account?: SubstrateDiscovery.Account
  connectAccount(account: SubstrateDiscovery.Account): void
  disconnectAccount(): void
  provider?: SubstrateDiscovery.Provider
  chainId: string
  setChainId: (chainId: string) => void
}

const UnstableProvider = createContext<Context>(null!)

/* eslint-disable react-refresh/only-export-components */
export const useUnstableProvider = () => useContext(UnstableProvider)

export const UnstableProviderProvider = ({
  children,
  defaultChainId,
}: {
  children: ReactNode
  defaultChainId: string
}) => {
  const { data: providerDetails } = useSWR("getProviders", () =>
    SubstrateDiscovery.discoverProviders(),
  )
  const [providerDetail, setProviderDetail] =
    useState<SubstrateDiscovery.ProviderDetail>()
  const { data: provider } = useSWR(
    () => `providerDetail.${providerDetail!.info.uuid}.provider`,
    () => providerDetail!.provider,
  )

  const [chainId, setChainId_] = useState(defaultChainId)
  const { data: accounts } = useSWR(
    () =>
      `providerDetail.${providerDetail!.info.uuid}.provider.getAccounts(${chainId})`,
    async () =>
      (await providerDetail!.provider)?.accounts?.getAccounts(chainId),
  )
  const [account, setAccount] = useState<SubstrateDiscovery.Account>()
  const disconnectAccount = () => setAccount(undefined)
  const disconnectProviderDetail = () => {
    disconnectAccount()
    setProviderDetail(undefined)
  }
  const setChainId = (chainId: string) => {
    setChainId_(chainId)
    disconnectAccount()
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
        setChainId,
      }}
    >
      {children}
    </UnstableProvider.Provider>
  )
}
