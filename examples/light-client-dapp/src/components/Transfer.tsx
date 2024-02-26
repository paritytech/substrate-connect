import { Account } from "@polkadot-api/legacy-polkadot-provider"
import { FormEventHandler, FunctionComponent, useEffect, useState } from "react"
import Select from "react-select"

export type Props = {
  accounts: Account[]
}

export const Transfer: FunctionComponent<Props> = ({ accounts }) => {
  // TODO: handle form fields and submission with react
  // TODO: fetch selected account balance
  // TODO: validate destination address
  // TODO: use PAPI to encode the transaction calldata
  // TODO: transfer should trigger an extension popup that signs the transaction
  // TODO: extract transaction submission into a hook
  // TODO: follow transaction submission events until it is finalized

  useEffect(() => {
    console.log("accounts", accounts)
  }, [accounts])

  const options = accounts.map((account) => ({
    value: account.address,
    label: account.displayName,
  }))
  const [selectedOption, setSelectedOption] = useState<any>(null)

  const onSubmit: FormEventHandler = (e) => {
    e.preventDefault()
  }

  return (
    <article>
      <header>Transfer funds</header>
      <form onSubmit={onSubmit}>
        <Select
          defaultValue={selectedOption}
          onChange={setSelectedOption}
          options={options}
        />
        {selectedOption && <small>Balance: 123456789</small>}
        <input placeholder="to"></input>
        <input type="number" placeholder="amount"></input>
        <footer>
          <button type="submit">Transfer</button>
        </footer>
      </form>
    </article>
  )
}
