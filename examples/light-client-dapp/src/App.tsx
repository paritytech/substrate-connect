import { useEffect, useState } from "react"
import { Transfer } from "./components/Transfer"
import {
  Account,
  getLegacyProvider,
} from "@polkadot-api/legacy-polkadot-provider"
import { createScClient } from "@substrate/connect"

function App() {
  const [{ relayChains, connectAccounts }, _2] = useState(
    getLegacyProvider(createScClient()),
  )
  const [accounts, setAccounts] = useState<Account[]>([])

  useEffect(() => {
    ;(async () => {
      await connectAccounts("polkadot-js")
      const accounts = await relayChains.westend2.getAccounts()
      setAccounts(accounts)
    })()
  }, [connectAccounts, relayChains])

  return (
    <main className="container" style={{ maxWidth: "700px" }}>
      <h1>Light Client DApp</h1>
      <Transfer accounts={accounts} />
    </main>
  )
}

export default App
