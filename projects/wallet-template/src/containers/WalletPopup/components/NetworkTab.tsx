import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"

import { NetworkTabProps, App, OptionsNetworkTabHealthContent } from "@/types"
import { IconWeb3 } from "@/components/IconWeb3"
import { Skeleton } from "@/components/ui/skeleton"

type NetworkContentProps = {
  health?: OptionsNetworkTabHealthContent
  apps: App[]
  network: string
}

const NetworkContent: React.FC<NetworkContentProps> = ({
  network,
  health,
  apps,
}) => {
  return (
    <div className="w-full max-w-full text-">
      <div className="grid grid-cols-2 gap-y-2">
        <>
          <div className="col-span-1 font-bold">Latest block</div>
          {health?.bestBlockHeight?.toLocaleString("en-US") ? (
            <div
              className="col-span-1 text-[#24CC85]"
              data-testid={`${network}-blockheight`}
              data-blockheight={health?.bestBlockHeight}
            >
              {health?.bestBlockHeight?.toLocaleString("en-US")}
            </div>
          ) : (
            <Skeleton className="w-16 h-full" />
          )}
        </>
        <>
          <div className="col-span-1 font-bold">Light Client</div>
          <div className="flex items-center col-span-1">
            {health?.isSyncing ? (
              <span className="animate-pulse">Synchronizing</span>
            ) : (
              "Synchronized"
            )}
          </div>
        </>
        <Separator className="col-span-2 my-2" />
        <>
          <div className="col-span-1 font-bold">Network</div>
          <div className="col-span-1 capitalize">{network}</div>
        </>
        <>
          <div className="col-span-1"></div>
          <div className="col-span-1 capitalize">{health?.status}</div>
        </>
        <Separator className="col-span-2 my-2" />
        <>
          <div className="col-span-1 font-bold">Peers</div>
          <div className="col-span-1">{health?.peers}</div>
        </>
        <>
          <div className="col-span-1 font-bold">Apps</div>
          <div className="col-span-1">{apps.length}</div>
        </>
        <>
          <div className="col-span-1"></div>
          <div className="col-span-1">
            {apps.map((app) => (
              <div className="flex" key={app.url}>
                {app.url}
              </div>
            ))}
          </div>
        </>
      </div>
    </div>
  )
}

const NetworkTab: React.FC<NetworkTabProps> = ({
  name,
  isWellKnown,
  health,
  apps,
}) => {
  return (
    <AccordionItem value={name}>
      <AccordionTrigger>
        <div className="flex items-center space-x-2">
          <IconWeb3 isWellKnown={isWellKnown}>{name.toLowerCase()}</IconWeb3>
          <div className="text-lg capitalize md:text-xl">
            <span data-testid={`chain${name}`}>{name}</span>
            <span className="pl-2 text-muted-foreground">
              {apps.length ? "(" + apps.length + ")" : ""}
            </span>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <NetworkContent health={health} apps={apps} network={name} />,
      </AccordionContent>
    </AccordionItem>
  )
}

export default NetworkTab
