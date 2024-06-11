import { Trash2Icon } from "lucide-react"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import { useState } from "react"
import type { ChainSpec } from "@/background/types"
import ReactJson from "react-json-view"
import { useDebounceCallback } from "usehooks-ts"
import { CopyButton } from "../../components"

const immutableChains = ["Polkadot", "Kusama", "Westend"]
namespace ChainsAccordion {
  export type Props = {
    chainSpecs: ChainSpec[]
    deleteChainSpec: (chainSpec: ChainSpec) => Promise<void>
  }
}

const ChainsAccordion: React.FC<ChainsAccordion.Props> = ({
  chainSpecs,
  deleteChainSpec,
}) => {
  const [error, setError] = useState<Error | null>(null)
  const setErrorDebounced = useDebounceCallback(setError, 5000)

  return (
    <Accordion type="single" collapsible>
      {chainSpecs.map((chainSpec, index) => (
        <AccordionItem key={index} value={chainSpec.name}>
          <AccordionTrigger>
            <div className="flex items-center justify-between text-lg text-foreground">
              {chainSpec.name}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ReactJson
              src={JSON.parse(chainSpec.raw)}
              displayDataTypes={false}
              collapsed={1}
            />
            {chainSpec.relay_chain && (
              <div className="mb-2 text-sm">
                <span className="font-bold">Relay Chain: </span>
                {chainSpec.relay_chain}
              </div>
            )}
            <div className="flex items-center space-x-4">
              <CopyButton text={chainSpec.raw} />
              {!immutableChains.includes(chainSpec.name) && (
                <Trash2Icon
                  onClick={() =>
                    deleteChainSpec(chainSpec).catch((err: Error) => {
                      setError(err)
                      setErrorDebounced(null)
                    })
                  }
                  className="w-4 h-4 cursor-pointer hover:text-destructive"
                />
              )}
            </div>
            {error && (
              <p className="mt-2 text-center text-destructive">
                {error.message}
              </p>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

namespace ListChainSpecs {
  export interface Props {
    chainSpecs: ReadonlyArray<ChainSpec>
    removeChainSpec: (chainSpec: ChainSpec) => Promise<void>
  }
}

export const ListChainSpecs: React.FC<ListChainSpecs.Props> = ({
  chainSpecs,
  removeChainSpec,
}) => {
  const relayChains =
    chainSpecs?.filter((chainSpec) => !chainSpec.relay_chain) ?? []
  const parachains =
    chainSpecs?.filter((chainSpec) => !!chainSpec.relay_chain) ?? []

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            Relaychains
            <Badge className="ml-2">{relayChains.length}</Badge>
          </CardTitle>
          <CardDescription className="text-foreground/70">
            List of all relaychains
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          <ChainsAccordion
            chainSpecs={relayChains}
            deleteChainSpec={removeChainSpec}
          />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>
            Parachains
            <Badge className="ml-2">{parachains.length}</Badge>
          </CardTitle>
          <CardDescription className="text-foreground/70">
            List of all parachains
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          <Accordion type="single" collapsible>
            <ChainsAccordion
              chainSpecs={parachains}
              deleteChainSpec={removeChainSpec}
            />
          </Accordion>
        </CardContent>
      </Card>
    </>
  )
}
