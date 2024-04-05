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
    provider && account
      ? ["systemAccount", provider, chainId, account.address]
      : null,
    ([_, provider, chainId, address], { next }) => {
      const subscription = systemAccount$(provider, chainId, address).subscribe(
        {
          next(systemAccount) {
            next(null, systemAccount)
          },
          error: next,
        },
      )
      return () => subscription.unsubscribe()
    },
  )
  return systemAccount
}
