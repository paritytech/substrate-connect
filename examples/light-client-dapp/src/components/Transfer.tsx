import { type FormEvent, useCallback, useState, useEffect } from "react"
import { lastValueFrom, tap } from "rxjs"
import {
  createTransaction,
  submitTransaction$,
  transferAllowDeathCallData,
} from "../api"
import { useUnstableProvider } from "../hooks"

type FinalizedTransaction = {
  blockHash: string
  index: number
}

export const Transfer = () => {
  const { account, provider, chainId } = useUnstableProvider()
  const [destination, setDestination] = useState<string>(
    "5CofVLAGjwvdGXvBiP6ddtZYMVbhT5Xke8ZrshUpj2ZXAnND",
  )
  const [amount, setAmount] = useState<bigint>(0n)
  const [transactionStatus, setTransactionStatus] = useState("")
  const [finalizedTransaction, setFinalizedTransaction] =
    useState<FinalizedTransaction>()
  const [error, setError] = useState<{ type: string; error: string }>()

  const [isSubmittingTransaction, setIsSubmittingTransaction] = useState(false)
  const handleOnSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      if (!account || !provider) {
        return
      }

      setIsSubmittingTransaction(true)
      setTransactionStatus("")
      setFinalizedTransaction(undefined)

      try {
        const callData = await transferAllowDeathCallData(
          provider,
          chainId,
          destination,
          amount,
        )
        const tx = await createTransaction(
          provider,
          chainId,
          account.address,
          callData,
        )
        const { txEvent } = await lastValueFrom(
          submitTransaction$(provider, chainId, tx).pipe(
            tap(({ txEvent }) => {
              setTransactionStatus(txEvent.type)
            }),
          ),
        )
        if (txEvent.type === "finalized")
          setFinalizedTransaction({
            blockHash: txEvent.block.hash,
            index: txEvent.block.index,
          })
      } catch (err) {
        if (err instanceof Error)
          setError({ type: "error", error: err.message })
        console.error(err)
      }

      setIsSubmittingTransaction(false)
    },
    [account, provider, chainId, destination, amount],
  )

  useEffect(() => {
    if (account) return
    setAmount(0n)
    setTransactionStatus("")
    setFinalizedTransaction(undefined)
  }, [account])

  // TODO: validate destination address
  return (
    <article>
      <header>Transfer funds</header>
      <form onSubmit={handleOnSubmit}>
        <fieldset>
          <label>
            To
            <input
              placeholder="to"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </label>
        </fieldset>
        <fieldset>
          <label>
            Amount
            <input
              type="number"
              placeholder="amount"
              value={`${amount}`}
              onChange={(e) => setAmount(BigInt(e.target.value))}
            />
          </label>
        </fieldset>
        <footer>
          <button type="submit" disabled={!account || isSubmittingTransaction}>
            Transfer
          </button>
          {transactionStatus ? (
            <p>
              Transaction Status: <b>{`${transactionStatus}`}</b>
            </p>
          ) : null}
          {finalizedTransaction && (
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
          )}
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
