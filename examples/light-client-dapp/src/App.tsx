import { Transfer, ConnectedAccount } from "./components"
import { UnstableProviderProvider } from "./hooks/useUnstableProvider"

// FIXME: use dynamic chainId
// Westend chainId
const chainId =
  "0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e"

export const App = () => {
  return (
    <UnstableProviderProvider chainId={chainId}>
      <main className="container" style={{ maxWidth: "700px" }}>
        <header>
          <h1>Light Client DApp</h1>
        </header>
        <ConnectedAccount />
        <Transfer />
      </main>
    </UnstableProviderProvider>
  )
}
