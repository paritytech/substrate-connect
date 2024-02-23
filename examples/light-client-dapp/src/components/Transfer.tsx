import { useEffect, useState } from "react"
import { Account, UnstableProvider } from "../types"

type Props = {
  provider: UnstableProvider
}

export const Transfer = ({ provider }: Props) => {
  const [accounts, setAccounts] = useState<Account[]>([])
  useEffect(() => {
    provider.getAccounts().then((accounts) => {
      setAccounts(accounts)
    })
  }, [provider])

  // TODO: handle form fields and submission with react
  // TODO: fetch accounts from extension
  // TODO: fetch selected account balance
  // TODO: validate destination address
  // TODO: use PAPI to encode the transaction calldata
  // TODO: transfer should trigger an extension popup that signs the transaction
  // TODO: extract transaction submission into a hook
  // TODO: follow transaction submission events until it is finalized
  return (
    <article>
      <header>Transfer funds</header>
      <form>
        <select defaultValue={""}>
          <option disabled value={""}>
            Select Account...
          </option>
          {accounts.map((account) => (
            <option key={account.address} value={account.address}>
              {account.address}
            </option>
          ))}
        </select>
        <small>Balance: 123456789</small>
        <input placeholder="to"></input>
        <input type="number" placeholder="amount"></input>
        <footer>
          <button>Transfer</button>
        </footer>
      </form>
    </article>
  )
}
