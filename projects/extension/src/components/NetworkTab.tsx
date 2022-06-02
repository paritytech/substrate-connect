import React, { FunctionComponent } from "react"
import { Accordion } from "."

import { NetworkTabProps, App, OptionsNetworkTabHealthContent } from "../types"
import "../main.css"
import IconWeb3 from "./IconWeb3"

const networkColors: Record<string, string> = {
  polkadot: "#E6007A",
  kusama: "#2F2F2F",
  westend: "#FF9C28",
  rococo: "#696bff",
}

interface NetworkContentProps {
  health?: OptionsNetworkTabHealthContent
  apps: App[]
  network: string
}

const NetworkContent = ({ network, health, apps }: NetworkContentProps) => {
  return (
    <div className="w-full text-[#171717] text-xs">
      <div className="flex flex-row pb-2">
        <div className="basis-1/5 font-bold">Last block:</div>
        <div className="basis-4/5">12,824,996</div>
      </div>
      <div className="flex flex-row pb-2 border-b-[1px] border-[#e7e7e7]">
        <div className="basis-1/5 font-bold">Light Client</div>
        <div className="basis-4/5">
          {health?.isSyncing ? "Synchronizing" : "Synchronized"}
        </div>
      </div>
      <div className="flex flex-row py-2">
        <div className="basis-1/5 font-bold">Network</div>
        <div className="basis-4/5">{network}</div>
      </div>
      <div className="flex flex-row pb-2 border-b-[1px] border-[#e7e7e7]">
        <div className="basis-1/5"></div>
        <div className="basis-4/5">Chain is {health?.status}</div>
      </div>

      <div className="flex flex-row py-2 border-b-[1px] border-[#e7e7e7]">
        <div className="basis-1/5 font-bold">Peers</div>
        <div className="basis-4/5">{health?.peers}</div>
      </div>
      <div className="flex flex-row py-2">
        <div className="basis-1/5 font-bold">Apps</div>
        <div className="basis-4/5">{apps.length}:</div>
      </div>
      <div className="flex flex-row pb-2">
        <div className="basis-1/5"></div>
        <div className="basis-4/5">
          {apps.map((app) => (
            <div className="flex" key={app.url}>
              {app.url}
            </div>
          ))}
        </div>
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
    <div className="flex w-full max-w-2xl mb-3 items-baseline">
      <Accordion
        titles={[
          <div className="flex rounded-lg">
            <div className="networkicon_container">
              <IconWeb3>{name.toLowerCase()}</IconWeb3>
              <div className="txt-xl cap">
                {name}
                <span className="pl-2 text-[#616161]">({apps.length})</span>
              </div>
            </div>
          </div>,
        ]}
        contents={[
          <NetworkContent health={health} apps={apps} network={name} />,
        ]}
      />
    </div>
  )
}

export default NetworkTab
