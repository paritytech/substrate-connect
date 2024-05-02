import { Transfer, ConnectedAccount, ChainSelect } from "./components"
import { ToastProvider } from "./components"
import { UnstableProviderProvider } from "./hooks/useUnstableProvider"
import { DEFAULT_CHAIN_ID } from "./settings"

export const App = () => {
  return (
    <ToastProvider>
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
    </ToastProvider>
  )
}
