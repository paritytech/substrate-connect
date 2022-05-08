import React, {
  FunctionComponent,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react"
import { Accordion, StatusCircle } from "."

import { NetworkTabProps, App, OptionsNetworkTabHealthContent } from "../types"
import "../main.css"

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

const networkColors: Record<string, string> = {
  polkadot: "#E6007A",
  kusama: "#2F2F2F",
  westend: "#FF9C28",
  rococo: "#696bff",
}

interface NetworkContentProps {
  health: OptionsNetworkTabHealthContent
  apps: App[]
  network: string
}

const NetworkContent = ({ network, health, apps }: NetworkContentProps) => {
  return (
    <div className="w-full text-white text-md">
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
    <div className="flex w-full max-w-2xl mb-3">
      <div className="flex items-center justify-center w-12 h-12">
        <StatusCircle
          size="medium"
          color={
            health && health.status === "connected" ? "#16DB9A" : "transparent"
          }
        />
      </div>
      <Accordion
        titles={[
          <>
            <div className="flex rounded-md">
              <div
                className="networkicon_container"
                style={{ color: networkColors[name.toLowerCase()] }}
              >
                <div
                  className="icon txt-xl"
                  style={{ marginRight: "0.625rem" }}
                >
                  {name.toLowerCase()}
                </div>
                <div
                  className="txt-xl cap"
                  style={{ color: networkColors[name.toLowerCase()] }}
                >
                  {name.toLowerCase()}
                </div>
              </div>
            </div>
            <div className="text-base">
              Peer{health && health.peers === 1 ? "" : "s"}:{" "}
              {(health && health.peers) ?? ".."}
            </div>
          </>,
        ]}
        contents={[
          <NetworkContent health={health} apps={apps} network={name} />,
        ]}
      ></Accordion>
    </div>
  )
}

export default NetworkTab
