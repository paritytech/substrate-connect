import { useMemo } from "react"
import { useActiveChains } from "../hooks/useActiveChains"
import { NetworkTabProps } from "../types"
import NetworkTab from "./NetworkTab"

export const Networks = () => {
  const chains = useActiveChains()
  const networks: NetworkTabProps[] = useMemo(
    () =>
      chains.map(({ chainName, isWellKnown, details }) => {
        return {
          isWellKnown,
          name: chainName,
          health: {
            isSyncing: details[0].isSyncing,
            peers: details[0].peers,
            status: "connected",
            bestBlockHeight: details[0].bestBlockHeight,
          },
          apps: details.map(({ url }) => ({
            name: url ?? "",
            url: url,
          })),
        }
      }),
    [chains],
  )
  return (
    <section className="mx-0 md:mx-12 xl:mx-36 2xl:mx-64">
      <div className="font-inter font-bold text-3xl pb-4">Networks</div>
      {networks.length ? (
        networks.map((network, i) => {
          const { name, health, apps, isWellKnown } = network
          return (
            <NetworkTab
              key={i}
              name={name}
              health={health}
              isWellKnown={isWellKnown}
              apps={apps}
            />
          )
        })
      ) : (
        <div>The extension isn't connected to any network.</div>
      )}
    </section>
  )
}
