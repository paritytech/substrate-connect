import { Transfer } from "./components/Transfer"
import { useProvider } from "./hooks"

function App() {
  const { provider } = useProvider()
  if (!provider) return null
  return (
    <main className="container" style={{ maxWidth: "700px" }}>
      <h1>Light Client DApp</h1>
      <Transfer provider={provider} />
    </main>
  )
}

export default App
