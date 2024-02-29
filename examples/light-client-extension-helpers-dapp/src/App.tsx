import { Chains } from "./containers/Chains"
import { useLightClientProvider } from "./hooks/useProvider"

function App() {
  const { provider } = useLightClientProvider("extension-unique-id")
  if (!provider) {
    return (
      <main className="container">
        <h1>Extension Test DApp</h1>
      </main>
    )
  }

  return <Chains provider={provider} />
}

export default App
