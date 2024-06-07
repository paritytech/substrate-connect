import { useMemo } from "react"
import { useActiveChains } from "@/hooks/useActiveChains"
import { NetworkTabProps } from "@/types"
import { Layout2 } from "@/components/Layout2"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion } from "@/components/ui/accordion"
import { BottomNavBar, Header } from "../components"
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { IconWeb3 } from "@/components/IconWeb3"
import { Skeleton } from "@/components/ui/skeleton"

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
    <Layout2>
      <Header />
      <div className="flex items-center justify-between px-6 mt-4 mb-4 sm:px-8">
        <h2 className="text-xl font-semibold">Networks</h2>
      </div>

      <ScrollArea className="px-6 mb-4 grow sm:px-8">
        <section>
          {networks.length ? (
            <Accordion type="multiple" className="w-full">
              {networks.map(({ name, health, apps, isWellKnown }, i) => (
                <AccordionItem value={name} key={i}>
                  <AccordionTrigger>
                    <div>
                      <div className="flex items-center space-x-2">
                        <IconWeb3 isWellKnown={isWellKnown}>
                          {name.toLowerCase()}
                        </IconWeb3>
                        <div className="text-lg capitalize md:text-xl">
                          {name}
                          <span className="pl-2 text-muted-foreground">
                            {apps.length ? "(" + apps.length + ")" : ""}
                          </span>
                        </div>
                      </div>
                      <div className="flex pt-2 text-sm">
                        <span>Latest block</span>
                        <span
                          className="pl-2 text-[#38A276]"
                          data-testid="blockheight"
                          data-blockheight={health?.bestBlockHeight}
                        >
                          {health?.bestBlockHeight?.toLocaleString("en-US") || (
                            <Skeleton className="w-16 h-full" />
                          )}
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div>
                      {apps.map((app) => (
                        <div className="flex" key={app.url}>
                          {app.url}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div>The extension isn't connected to any network.</div>
          )}
        </section>
      </ScrollArea>

      <BottomNavBar currentItem="networks" />
    </Layout2>
  )
}
