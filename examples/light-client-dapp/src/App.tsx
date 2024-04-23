import { Transfer, ConnectedAccount } from "./components"
import { UnstableProviderProvider } from "./hooks/useUnstableProvider"
import * as select from "@zag-js/select"
import { useMachine, normalizeProps } from "@zag-js/react"
import { useId } from "react"

const chainData = [
  {
    label: "Polkadot",
    value: "0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3",
  },
  {
    label: "Kusama",
    value: "0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe",
  },
  {
    label: "Westend",
    value: "0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e",
  },
] as const

export const App = () => {
  const chains = select.collection({
    items: chainData,
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
  })

  const [state, send] = useMachine(
    select.machine({
      id: useId(),
      collection: chains,
      value: [chainData[2].value],
    }),
  )

  const api = select.connect(state, send, normalizeProps)

  return (
    <UnstableProviderProvider chainId={api.value[0]}>
      <main className="container" style={{ maxWidth: "700px" }}>
        <header>
          <h1>Light Client DApp</h1>
        </header>
        <article>
          <div style={{ display: "flex" }}>
            <label
              htmlFor="relaychain-dropdown"
              style={{
                alignContent: "center",
                flexGrow: 10,
                fontWeight: "bold",
              }}
            >
              Network:
            </label>
            <div
              style={{
                flexGrow: 1,
              }}
            >
              <select
                id="relaychain-dropdown"
                onChange={(e) =>
                  api.selectValue(chainData[e.target.selectedIndex].value)
                }
                style={{
                  cursor: "pointer",
                }}
              >
                {chainData.map(({ label, value }, index) => (
                  <option
                    key={index}
                    value={value}
                    selected={value === api.value[0]}
                  >
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </article>
        <ConnectedAccount />
        <Transfer />
      </main>
    </UnstableProviderProvider>
  )
}
