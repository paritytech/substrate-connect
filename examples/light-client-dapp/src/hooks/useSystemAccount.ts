import useSWRSubscription from "swr/subscription"
import { useUnstableProvider } from "./useUnstableProvider"
import { systemAccount$ } from "../api"

export type SystemAccountStorage = {
  consumers: number
  data: {
    flags: bigint
    free: bigint
    frozen: bigint
    reserved: bigint
  }
  nonce: number
  providers: number
  sufficients: number
}

export const useSystemAccount = () => {
  const { provider, chainId, account } = useUnstableProvider()
  const { data: systemAccount } = useSWRSubscription(
    provider?.chains && account
      ? ["systemAccount", provider.chains, chainId, account.address]
      : null,
    ([_, api, chainId, address], { next }) => {
      const subscription = systemAccount$(api, chainId, address).subscribe({
        next(systemAccount) {
          next(null, systemAccount)
        },
        error: next,
      })
      return () => subscription.unsubscribe()
    },
  )
  return systemAccount
}
