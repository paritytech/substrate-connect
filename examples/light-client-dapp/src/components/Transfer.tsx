import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import { UnstableWallet } from "@substrate/unstable-wallet-provider"
import Select from "react-select"
import { transaction, transferAllowDeathCallData } from "../transaction"
import { lastValueFrom, mergeMap, tap } from "rxjs"
import { useSystemAccount } from "../hooks"

type Props = {
  provider: UnstableWallet.Provider
}

type FinalizedTransaction = {
  blockHash: string
  index: number
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
  const [transactionStatus, setTransactionStatus] = useState("")
  const [finalizedTransaction, setFinalizedTransaction] =
    useState<FinalizedTransaction | null>()
  const [error, setError] = useState<{ type: string; error: string }>()

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
      setFinalizedTransaction(null)

      const sender = selectedAccount.value
      const connectProvider = { ...provider, connect }

      try {
        await lastValueFrom(
          transferAllowDeathCallData(connectProvider, destination, amount).pipe(
            mergeMap((callData) =>
              transaction(connectProvider, chainId, sender, callData),
            ),
            tap(({ txEvent }) => {
              setTransactionStatus(txEvent.type)
              if (txEvent.type === "finalized") {
                setFinalizedTransaction({
                  blockHash: txEvent.block.hash,
                  index: txEvent.block.index,
                })
              }
              if (txEvent.type === "invalid" || txEvent.type === "dropped") {
                setError({ type: txEvent.type, error: txEvent.error })
              }
            }),
          ),
        )
      } catch (err) {
        if (err instanceof Error) {
          setError({ type: "error", error: err.message })
        }
        console.error(err)
      }

      setIsSubmittingTransaction(false)
    },
    [selectedAccount, provider, connect, destination, amount],
  )

  const accountOptions = accounts.map((account) => ({
    value: account.address,
    label: account.address,
  }))

  // TODO: validate destination address
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
          {finalizedTransaction ? (
            <div>
              <p>
                Finalized Block Hash:{" "}
                <b>
                  <a
                    href={`https://westend.subscan.io/block/${finalizedTransaction.blockHash}`}
                  >{`${finalizedTransaction.blockHash}`}</a>
                </b>
              </p>
              <p>
                Transaction Index: <b>{finalizedTransaction.index}</b>
              </p>
            </div>
          ) : null}
          {error ? (
            <p>
              Error: <b>{`type: ${error.type}, error: ${error.error}`}</b>
            </p>
          ) : null}
        </footer>
      </form>
    </article>
  )
}
