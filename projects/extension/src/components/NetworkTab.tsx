import React, { FunctionComponent, useMemo } from "react"
import { StatusCircle } from "."

import { NetworkTabProps, App, OptionsNetworkTabHealthContent } from "../types"
import { Accordion, AccordionItem } from "./Accordion"
import { getChain, Network, NetworkIcon } from "mottled-library"
import "mottled-library/css/core.css"
import "mottled-library/css/NetworkIcon.css"

export const emojis = {
  chain: "🔗",
  tick: "✅",
  info: "ℹ️",
  deal: "🤝",
  chequeredFlag: "🏁",
  star: "✨",
  clock: "🕒",
  apps: "📺",
  seedling: "🌱",
}

interface NetworkContentProps {
  health: OptionsNetworkTabHealthContent
  apps: App[]
  network: string
}

const NetworkContent = ({ network, health, apps }: NetworkContentProps) => {
  return (
    <div className="text-md text-white w-full">
      <div className="flex flex-row">
        <div className="basis-1/3">{emojis.seedling} Light Client</div>
        <div className="basis-2/3">
          {health.isSyncing ? "Synchronizing" : "Synchronized"}
        </div>
      </div>
      <div className="flex flex-row">
        <div className="basis-1/3">{emojis.star} Network</div>
        <div className="basis-2/3">Chain is {health.status}</div>
      </div>

      <div className="flex flex-row">
        <div className="basis-1/3">{emojis.deal} Peers</div>
        <div className="basis-2/3">{health.peers}</div>
      </div>
      <div className="flex flex-row">
        <div className="basis-1/3">{emojis.apps} Apps</div>
        <div className="basis-2/3">{apps.length}:</div>
      </div>
      <div className="flex flex-row">
        <div className="basis-1/3"></div>
        <div className="basis-2/3">
          {apps.map((app) => (
            <div className="flex" key={app.url}>
              {app.url}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-row">
        <div className="basis-1/3"></div>
        <div className="basis-2/3"></div>
      </div>
    </div>
  )
}

const NetworkTab: FunctionComponent<NetworkTabProps> = ({
  name,
  health,
  apps,
}: NetworkTabProps) => {
  return (
    <div className="w-full max-w-2xl mb-3 flex">
      <div className="flex items-center justify-center w-12 h-12">
        <StatusCircle
          size="medium"
          color={
            health && health.status === "connected" ? "#16DB9A" : "transparent"
          }
        />
      </div>
      <Accordion>
        <AccordionItem
          title={
            <>
              <div className="flex rounded-md">
                <NetworkIcon
                  cName="text-black"
                  network={name.toLowerCase() as Network}
                  show="both"
                  size="xl"
                  color={useMemo(
                    () => getChain(name.toLocaleLowerCase())?.color,
                    [name],
                  )}
                />
              </div>
              <div className="text-base">
                Peer{health && health.peers === 1 ? "" : "s"}:{" "}
                {(health && health.peers) ?? ".."}
              </div>
            </>
          }
          value={name}
        >
          <NetworkContent health={health} apps={apps} network={name} />
        </AccordionItem>
      </Accordion>
    </div>
  )
}

export default NetworkTab
