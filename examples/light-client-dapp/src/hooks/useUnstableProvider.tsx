import { type ReactNode, createContext, useContext, useState } from "react"
import { Unstable } from "@substrate/connect-discovery"
import useSWR from "swr"

type Context = {
  providerDetails?: Unstable.SubstrateConnectProviderDetail[]
  providerDetail?: Unstable.SubstrateConnectProviderDetail
  connectProviderDetail(detail: Unstable.SubstrateConnectProviderDetail): void
  disconnectProviderDetail(): void
  // FIXME: accounts is chain specific
  accounts?: Unstable.Account[]
  account?: Unstable.Account
  connectAccount(account: Unstable.Account): void
  disconnectAccount(): void
  provider?: Unstable.Provider
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
    Unstable.getSubstrateConnectExtensionProviders(),
  )
  const [providerDetail, setProviderDetail] =
    useState<Unstable.SubstrateConnectProviderDetail>()
  const { data: provider } = useSWR(
    () => `providerDetail.${providerDetail!.info.uuid}.provider`,
    () => providerDetail!.provider,
  )

  const [chainId, setChainId_] = useState(defaultChainId)
  const { data: accounts } = useSWR(
    () =>
      `providerDetail.${providerDetail!.info.uuid}.provider.getAccounts(${chainId})`,
    async () => (await providerDetail!.provider).getAccounts(chainId),
  )
  const [account, setAccount] = useState<Unstable.Account>()
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
