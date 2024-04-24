import { Transfer, ConnectedAccount, ChainSelect } from "./components"
import { UnstableProviderProvider } from "./hooks/useUnstableProvider"
import { DEFAULT_CHAIN_ID } from "./settings"

export const App = () => {
  return (
    <UnstableProviderProvider defaultChainId={DEFAULT_CHAIN_ID}>
      <main className="container" style={{ maxWidth: "700px" }}>
        <header>
          <h1>Light Client DApp</h1>
        </header>
        <ChainSelect />
        <ConnectedAccount />
        <Transfer />
      </main>
    </UnstableProviderProvider>
  )
}
