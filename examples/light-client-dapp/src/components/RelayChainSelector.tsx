import { useState } from "react"

export const RelayChainNetworkSelector = () => {
  const networks = [
    {
      name: "Polkadot",
      isSynchronized: true,
    },
    {
      name: "Kusama",
      isSynchronized: false,
    },
    {
      name: "Rococo",
      isSynchronized: true,
    },
    {
      name: "Westend",
      isSynchronized: false,
    },
  ]
  const [selectedNetwork, setSelectedNetwork] = useState(networks[0])
  return (
    <article>
      <div style={{ display: "flex" }}>
        <label
          htmlFor="relaychain-dropdown"
          style={{ alignContent: "center", flexGrow: 10, fontWeight: "bold" }}
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
              setSelectedNetwork(networks[e.target.selectedIndex])
            }
            style={{
              cursor: "pointer",
            }}
          >
            {networks.map((network, index) => (
              <option key={index} value={network.name}>
                {network.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: "flex" }}>
        <div
          style={{
            fontWeight: "bold",
            flexGrow: 10,
          }}
        >
          Synchronization Status:
        </div>
        <div style={{ flexGrow: 1 }}>
          <span
            style={{
              padding: "5px 10px",
              backgroundColor: selectedNetwork.isSynchronized
                ? "#4CAF50"
                : "#f44336",
              color: "white",
              borderRadius: "4px",
            }}
          >
            {selectedNetwork.isSynchronized ? "Up to Date" : "Syncing..."}
          </span>
        </div>
      </div>
    </article>
  )
}
