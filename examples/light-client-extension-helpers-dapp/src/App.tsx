import { Chains } from "./containers/Chains"
import { useLightClientProvider } from "./hooks/useProvider"

function App() {
  const { provider } = useLightClientProvider("extension-unique-id")
  if (!provider) return null

  return <Chains provider={provider} />
}

export default App
