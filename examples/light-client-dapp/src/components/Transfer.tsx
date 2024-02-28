import { FormEvent, useCallback, useEffect, useState } from "react"
import { ss58Decode } from "@polkadot-labs/hdkd-helpers"
import { UnstableWallet } from "@substrate/unstable-wallet-provider"
import { toHex } from "@polkadot-api/utils"
import { filter, firstValueFrom } from "rxjs"
import { getObservableClient } from "@polkadot-api/client"
import { ConnectProvider, createClient } from "@polkadot-api/substrate-client"
import { getDynamicBuilder } from "@polkadot-api/metadata-builders"
import Select from "react-select"
import { useSystemAccount } from "../hooks"

type SystemAccountStorage = {
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

type Props = {
  provider: UnstableWallet.Provider
}

const getBalance = (provider: ConnectProvider) => async (address: string) => {
  const client = getObservableClient(createClient(provider))

  const { metadata$, unfollow, storage$ } = client.chainHead$()

  const metadata = await firstValueFrom(metadata$.pipe(filter(Boolean)))
  const dynamicBuilder = getDynamicBuilder(metadata)
  const storageAccount = dynamicBuilder.buildStorage("System", "Account")

  const balanceQuery$ = storage$(null, "value", () =>
    storageAccount.enc(address),
  )

  const storageResult = storageAccount.dec(
    await firstValueFrom(balanceQuery$.pipe(filter(Boolean))),
  ) as SystemAccountStorage
  const balance = storageResult.data.free

  unfollow()
  client.destroy()

  return balance
}

// FIXME: use dynamic chainId
// Westend chainId
const chainId =
  "0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e"

export const Transfer = ({ provider }: Props) => {
  const [accounts, setAccounts] = useState<UnstableWallet.Account[]>([])
  const [selectedAccount, setSelectedAccount] = useState<{
    value: string
    label: string
  } | null>(null)
  const balance = useSystemAccount(
    provider.getChains()[chainId].connect,
    selectedAccount ? selectedAccount.value : null,
  )

  useEffect(() => {
    provider.getAccounts(chainId).then((accounts) => {
      setAccounts(accounts)
    })
  }, [provider])

  const [isCreatingTransaction, setIsCreatingTransaction] = useState(false)
  const handleOnSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      setIsCreatingTransaction(true)
      try {
        const tx = await provider.createTx(
          chainId,
          toHex(ss58Decode(accounts[0].address)[0]),
          "0x04030012aed8a0f7425c9f4c71e75bf087e9c68ab701b1faa23a10e4785d722d962115070010a5d4e8",
        )
        console.log({ tx })
      } catch (error) {
        console.error(error)
      }
      setIsCreatingTransaction(false)
    },
    [provider, accounts],
  )

  const accountOptions = accounts.map((account) => ({
    value: account.address,
    label: account.address,
  }))

  // TODO: handle form fields and submission with react
  // TODO: fetch accounts from extension
  // TODO: validate destination address
  // TODO: use PAPI to encode the transaction calldata
  // TODO: transfer should trigger an extension popup that signs the transaction
  // TODO: extract transaction submission into a hook
  // TODO: follow transaction submission events until it is finalized
  return (
    <article>
      <header>Transfer funds</header>
      <form onSubmit={handleOnSubmit}>
        <Select
          defaultValue={selectedAccount}
          onChange={setSelectedAccount}
          options={accountOptions}
        />

        <small>Balance: {`${balance}`}</small>
        <input placeholder="to"></input>
        <input type="number" placeholder="amount"></input>
        <footer>
          <button type="submit" disabled={isCreatingTransaction}>
            Transfer
          </button>
        </footer>
      </form>
    </article>
  )
}
