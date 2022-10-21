import React from "react"
import { NetworkTabProps } from "../types"
import NetworkTab from "./NetworkTab"

interface NetworksProps {
  networks: NetworkTabProps[]
}

export const Networks = ({ networks }: NetworksProps) => {
  return (
    <section className="mx-0 md:mx-12 xl:mx-36 2xl:mx-64">
      <div className="font-inter font-bold text-3xl pb-4">Networks</div>
      {networks.length ? (
        networks.map((network: NetworkTabProps, i: number) => {
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
