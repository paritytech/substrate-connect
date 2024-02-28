import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import { ss58Decode } from "@polkadot-labs/hdkd-helpers"
import { UnstableWallet } from "@substrate/unstable-wallet-provider"
import { toHex } from "@polkadot-api/utils"
import Select from "react-select"
import { useSystemAccount } from "../hooks"

type Props = {
  provider: UnstableWallet.Provider
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
  const connect = useMemo(() => provider.getChains()[chainId].connect, [provider])
  const accountStorage = useSystemAccount(
    connect,
    selectedAccount ? selectedAccount.value : null,
  )

  const balance = accountStorage?.data.free ?? 0n

  useEffect(() => {
    provider.getAccounts(chainId).then((accounts) => {
      setAccounts(accounts)
    })
  }, [provider])

  const [isCreatingTransaction, setIsCreatingTransaction] = useState(false)
  const handleOnSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      if (!selectedAccount) {
        return
      }

      setIsCreatingTransaction(true)
      try {
        const tx = await provider.createTx(
          chainId,
          toHex(ss58Decode(selectedAccount.value)[0]),
          "0x04030012aed8a0f7425c9f4c71e75bf087e9c68ab701b1faa23a10e4785d722d962115070010a5d4e8",
        )
        console.log({ tx })
      } catch (error) {
        console.error(error)
      }
      setIsCreatingTransaction(false)
    },
    [provider, selectedAccount],
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
          <button
            type="submit"
            disabled={!selectedAccount || isCreatingTransaction}
          >
            Transfer
          </button>
        </footer>
      </form>
    </article>
  )
}
