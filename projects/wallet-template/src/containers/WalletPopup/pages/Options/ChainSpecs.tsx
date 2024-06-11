import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { ListChainSpecs } from "./ListChainSpecs"
import useSWR from "swr"
import { rpc } from "../../api"
import { ChainSpec } from "@/background/types"
import { AddChainSpec } from "./AddChainSpec"

export const ChainSpecs = () => {
  const { data: chainSpecs, mutate } = useSWR(
    "rpc.getChainSpecs",
    () => rpc.client.getChainSpecs(),
    { revalidateOnFocus: true },
  )

  const [view, setView] = useState<"list" | "allow" | (string & {})>("list")

  const addChainSpec = async (rawChainSpec: string) => {
    await rpc.client.addChainSpec(rawChainSpec)
    await mutate()
  }

  const removeChainSpec = async (chainSpec: ChainSpec) => {
    await rpc.client.removeChainSpec(chainSpec.genesisHash)
    await mutate()
  }

  return (
    <div className="container">
      <h2 className="mb-6 text-3xl font-semibold">
        Manage Chain Specifications
      </h2>

      <Tabs defaultValue={view} onValueChange={setView}>
        <TabsList className="mb-6">
          <TabsTrigger value="list">Allowlist</TabsTrigger>
          <TabsTrigger value="allow">Add ChainSpec</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <ListChainSpecs
            chainSpecs={chainSpecs ?? []}
            removeChainSpec={removeChainSpec}
          />
        </TabsContent>

        <TabsContent value="allow">
          <AddChainSpec addChainSpec={addChainSpec} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
