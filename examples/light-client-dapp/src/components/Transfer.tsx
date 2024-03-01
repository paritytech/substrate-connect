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

const AccountId = (value: SS58String) =>
  Enum<
    {
      type: "Id"
      value: SS58String
    },
    "Id"
  >("Id", value)

// TODO: Extract to hook that creates and submits the tx while also managing
// the tx lifecycle
const createTransfer = (
  provider: ConnectProvider,
  destination: string,
  amount: bigint,
) => {
  const client = getObservableClient(createClient(provider))
  const { metadata$ } = client.chainHead$()

  return firstValueFrom(
    metadata$.pipe(
      filter(Boolean),
      map((metadata) => {
        const dynamicBuilder = getDynamicBuilder(metadata)
        const { location, args } = dynamicBuilder.buildCall(
          "Balances",
          "transfer_allow_death",
        )

        return toHex(
          mergeUint8(
            new Uint8Array(location),
            args.enc({
              dest: AccountId(destination),
              value: amount,
            }),
          ),
        )
      }),
    ),
  )
}

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
      try {
        const sender = selectedAccount.value
        const { txId, tx } = await transfer(sender, destination, amount)
        console.log({ txId, tx })

        lastValueFrom(
          transferSubscriptions[txId].pipe(
            tap({
              next: (e) => {
                console.log(`event:`, e)
              },
              error: (e) => {
                console.error(`ERROR:`, e)
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
        </footer>
      </form>
    </article>
  )
}
