import React, { FunctionComponent } from "react"
import { Accordion } from "."

import { NetworkTabProps, App, OptionsNetworkTabHealthContent } from "../types"
import "../main.css"
import { IconWeb3 } from "./IconWeb3"

interface NetworkContentProps {
  health?: OptionsNetworkTabHealthContent
  apps: App[]
  network: string
}

const NetworkContent = ({ network, health, apps }: NetworkContentProps) => {
  return (
    <div className="w-full text-[#171717] text-xs">
      <div className="flex flex-row pb-2">
        <div className="basis-1/5 font-bold">Latest block:</div>
        <div className="basis-4/5">
          {health?.bestBlockHeight?.toLocaleString("en-US")}
        </div>
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
        <div className="basis-4/5">{apps.length}</div>
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
  isWellKnown,
  health,
  apps,
}: NetworkTabProps) => {
  const contents = [
    <NetworkContent health={health} apps={apps} network={name} />,
  ]
  return (
    <div className="flex w-full mb-3 items-baseline font-roboto">
      <Accordion
        titles={[
          <div className="flex rounded-lg">
            <div className="networkicon_container">
              <IconWeb3 isWellKnown={isWellKnown}>
                {name.toLowerCase()}
              </IconWeb3>
              <div className="txt-xl cap">
                {name}
                <span className="pl-2 text-[#616161]">
                  {apps.length ? "(" + apps.length + ")" : ""}
                </span>
              </div>
            </div>
          </div>,
        ]}
        origin={"options"}
        contents={contents}
        showTitleIcon={!!contents.length}
      />
    </div>
  )
}

export default NetworkTab
