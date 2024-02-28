import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import { ss58Decode } from "@polkadot-labs/hdkd-helpers"
import { UnstableWallet } from "@substrate/unstable-wallet-provider"
import { mergeUint8, toHex } from "@polkadot-api/utils"
import Select from "react-select"
import { useSystemAccount } from "../hooks"
import { Binary, getObservableClient } from "@polkadot-api/client"
import { ConnectProvider, createClient } from "@polkadot-api/substrate-client"
import {
  Enum,
  Struct,
  Variant,
  compact,
  u8,
} from "@polkadot-api/substrate-bindings"
import { catchError, filter, first, map, mergeMap, tap } from "rxjs/operators"
import { getDynamicBuilder } from "@polkadot-api/metadata-builders"
import { SS58String } from "@polkadot-api/substrate-bindings"
import { AccountId } from "@polkadot-api/substrate-bindings"

type Props = {
  provider: UnstableWallet.Provider
}

// FIXME: use dynamic chainId
// Westend chainId
const chainId =
  "0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e"

const call = Struct({
  module: u8,
  method: u8,
  args: Struct({
    dest: Variant({
      Id: AccountId(42),
    }),
    value: compact,
  }),
})

// TODO: Extract to hook that creates and submits the tx while also managing
// the tx lifecycle
const createTransfer = (provider: ConnectProvider) => {
  const client = getObservableClient(createClient(provider))
  const { metadata$ } = client.chainHead$()
  metadata$
    .pipe(
      filter(Boolean),
      first(),
      map((metadata) => {
        const dynamicBuilder = getDynamicBuilder(metadata)
        const { location, args } = dynamicBuilder.buildCall(
          "Balances",
          "transfer_allow_death",
        )

        return Binary.fromBytes(
          mergeUint8(
            new Uint8Array(location),
            args.enc({
              dest: Enum<any>(
                "Id",
                "5DyTf5gsCQG3ycM1venTzjoEPMUhKtoU9e9zg1MvnJddbye8",
              ),
              value: 1000000n,
            }),
          ),
        )
      }),
    )
    .subscribe((a) => console.log("a", a.asHex()))
}

export const Transfer = ({ provider }: Props) => {
  const [accounts, setAccounts] = useState<UnstableWallet.Account[]>([])
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
        createTransfer(connect)
        const tx = await provider.createTx(
          chainId,
          toHex(ss58Decode(selectedAccount.value)[0]),
          "0x0400005478706d7da2c69c44b14beb981ee069c59ba83773ae02d8b0e8a714defcc26402093d00",
        )
        console.log({ tx })
      } catch (error) {
        console.error(error)
      }
      setIsCreatingTransaction(false)
    },
    [provider, selectedAccount, connect],
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
