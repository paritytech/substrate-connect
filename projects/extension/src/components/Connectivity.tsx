import React from "react"
import { NetworkTabProps } from "../types"
import NetworkTab from "./NetworkTab"

interface ConnectivityProps {
  networks: NetworkTabProps[]
}

export const Connectivity = ({ networks }: ConnectivityProps) => {
  return (
    <section className="mx-0 md:mx-12 xl:mx-36 2xl:mx-64">
      <div className="font-inter font-bold text-3xl pb-4">Connectivity</div>
      {networks.length ? (
        networks.map((network: NetworkTabProps, i: number) => {
          const { name, health, apps } = network
          return <NetworkTab key={i} name={name} health={health} apps={apps} />
        })
      ) : (
        <div>The extension isn't connected to any network.</div>
      )}
    </section>
  )
}
