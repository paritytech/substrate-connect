import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import { UnstableWallet } from "@substrate/unstable-wallet-provider"
import Select from "react-select"
import { useSystemAccount, useTransfer } from "../hooks"
import { lastValueFrom, tap } from "rxjs"

type Props = {
  provider: UnstableWallet.Provider
}

// FIXME: use dynamic chainId
// Westend chainId
const chainId =
  "0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e"

export const Transfer = ({ provider }: Props) => {
  const [accounts, setAccounts] = useState<UnstableWallet.Account[]>([])
  const [destination, setDestination] = useState<string>(
    "5CofVLAGjwvdGXvBiP6ddtZYMVbhT5Xke8ZrshUpj2ZXAnND",
  )
  const [amount, setAmount] = useState<bigint>(0n)
  const [selectedAccount, setSelectedAccount] = useState<{
    value: string
    label: string
  } | null>(null)
  const connect = useMemo(
    () => provider.getChains()[chainId].connect,
    [provider],
  )
  const accountStorage = useSystemAccount(
    connect,
    selectedAccount ? selectedAccount.value : null,
  )
  const { transfer, subscriptions: transferSubscriptions } = useTransfer(
    { ...provider, connect },
    chainId,
  )
  const [transactionStatus, setTransactionStatus] = useState("")
  const [finalizedHash, setFinalizedHash] = useState("")

  const balance = accountStorage?.data.free ?? 0n

  useEffect(() => {
    provider.getAccounts(chainId).then((accounts) => {
      setAccounts(accounts)
    })
  }, [provider])

  const [isSubmittingTransaction, setIsSubmittingTransaction] = useState(false)
  const handleOnSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      if (!selectedAccount) {
        return
      }

      setIsSubmittingTransaction(true)
      setTransactionStatus("")
      setFinalizedHash("")

      try {
        const sender = selectedAccount.value
        const { txId, destroy$ } = await transfer(sender, destination, amount)

        const cleanup = () => {
          destroy$.next()
          destroy$.complete()
          delete transferSubscriptions[txId]
        }

        lastValueFrom(
          transferSubscriptions[txId].pipe(
            tap({
              next: (e): void => {
                setTransactionStatus(e.type)
                if (e.type === "finalized") {
                  setFinalizedHash(e.block.hash)
                  cleanup()
                }
              },
              error: (e) => {
                setTransactionStatus(e.type)
                cleanup()
              },
            }),
          ),
        )
      } catch (error) {
        console.error(error)
      }
      setIsSubmittingTransaction(false)
    },
    [selectedAccount, transfer, destination, amount, transferSubscriptions],
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
        <input
          placeholder="to"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
        <input
          type="number"
          placeholder="amount"
          value={`${amount}`}
          onChange={(e) => setAmount(BigInt(e.target.value))}
        />
        <footer>
          <button
            type="submit"
            disabled={!selectedAccount || isSubmittingTransaction}
          >
            Transfer
          </button>
          {transactionStatus ? (
            <p>
              Transaction Status: <b>{`${transactionStatus}`}</b>
            </p>
          ) : null}
          {finalizedHash ? (
            <p>
              Finalized Hash: <b>{`${finalizedHash}`}</b>
            </p>
          ) : null}
        </footer>
      </form>
    </article>
  )
}
