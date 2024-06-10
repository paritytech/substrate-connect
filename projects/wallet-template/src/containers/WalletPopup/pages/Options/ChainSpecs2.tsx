import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { UploadIcon, Trash2Icon, CopyIcon } from "lucide-react"
import { useState } from "react"
import useSWR from "swr"
import { rpc } from "../../api"
import { ChainSpec } from "@/background/types"

export default function ChainSpecs2() {
  const { data: chainSpecs, mutate } = useSWR(
    "rpc.getChainSpecs",
    () => rpc.client.getChainSpecs(),
    { revalidateOnFocus: true },
  )

  const [view, setView] = useState("list")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [chainToRemove, setChainToRemove] = useState<ChainSpec | null>(null)
  const [inputMethod, setInputMethod] = useState("paste")

  const relayChains =
    chainSpecs?.filter((chainSpec) => !chainSpec.relay_chain) ?? []
  const parachains =
    chainSpecs?.filter((chainSpec) => !!chainSpec.relay_chain) ?? []

  const deleteChainSpec = async (chainSpec: ChainSpec) => {
    // TODO: error handling
    await rpc.client.removeChainSpec(chainSpec.genesisHash)
    await mutate()
    console.log(`chain spec ${chainSpec.id} removed`)
  }

  const [error, setError] = useState<string | null>(null)
  const immutableChains = ["Polkadot", "Kusama", "Westend"]

  const copyToClipboard = (spec: string) => {
    navigator.clipboard.writeText(spec)
  }

  const handleRemoveChain = () => {
    if (chainToRemove) {
      deleteChainSpec(chainToRemove)
      setIsConfirmDialogOpen(false)
    }
  }

  return (
    <div className="max-w-full p-6 bg-background">
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogTitle>Confirm Removal</DialogTitle>
          <DialogDescription className="text-foreground">
            Are you sure you want to remove this chain specification? This
            action cannot be undone.
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleRemoveChain}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Manage Chain Specifications
        </h1>
      </div>

      <Tabs defaultValue={view} onValueChange={setView}>
        <TabsList className="mb-6">
          <TabsTrigger value="list">View List</TabsTrigger>
          <TabsTrigger value="allow">Allow Spec</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>
                Relaychains
                <Badge className="ml-2">{relayChains.length}</Badge>
              </CardTitle>
              <CardDescription className="text-muted">
                List of all relaychains
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Separator className="mb-4" />
              <Accordion type="single" collapsible>
                {relayChains.map((chain, index) => (
                  <AccordionItem key={index} value={chain.name}>
                    <AccordionTrigger>
                      <div className="flex items-center justify-between text-foreground">
                        {chain.name}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Textarea value={chain.raw} readOnly className="mb-2" />
                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(chain.raw)}
                        >
                          <CopyIcon className="w-4 h-4 mr-2" />
                          Copy JSON
                        </Button>
                        {!immutableChains.includes(chain.name) && (
                          <div
                            onAnimationEnd={() => setError(null)}
                            className={`${error ? "animate-shake" : ""} duration-500`}
                          >
                            <Trash2Icon
                              onClick={() => {
                                setChainToRemove(chain)
                                setIsConfirmDialogOpen(true)
                              }}
                              className="w-4 h-4 cursor-pointer hover:text-destructive"
                            />
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>
                Parachains
                <Badge className="ml-2">{parachains.length}</Badge>
              </CardTitle>
              <CardDescription className="text-muted">
                List of all parachains
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Separator className="mb-4" />
              <Accordion type="single" collapsible>
                {parachains.map((chain, index) => (
                  <AccordionItem key={index} value={chain.name}>
                    <AccordionTrigger>
                      <div className="flex items-center justify-between text-foreground">
                        {chain.name}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Textarea value={chain.raw} readOnly className="mb-2" />
                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(chain.raw)}
                        >
                          <CopyIcon className="w-4 h-4 mr-2" />
                          Copy JSON
                        </Button>
                        {!immutableChains.includes(chain.name) && (
                          <div
                            onAnimationEnd={() => setError(null)}
                            className={`${error ? "animate-shake" : ""} duration-500`}
                          >
                            <Trash2Icon
                              onClick={() => {
                                setChainToRemove(chain)
                                setIsConfirmDialogOpen(true)
                              }}
                              className="w-4 h-4 cursor-pointer hover:text-destructive"
                            />
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allow">
          <Card>
            <CardHeader>
              <CardTitle>Allow a Chain Spec</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 mb-4">
                <RadioGroup
                  value={inputMethod}
                  onValueChange={setInputMethod}
                  className="mb-4"
                >
                  <div className="flex items-center mb-2">
                    <RadioGroupItem value="paste" />
                    <Label className="ml-2 text-foreground">
                      Paste Chain Spec JSON
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <RadioGroupItem value="upload" />
                    <Label className="ml-2 text-foreground">
                      Upload Chain Spec File
                    </Label>
                  </div>
                </RadioGroup>
                {inputMethod === "paste" && (
                  <div>
                    <Label className="text-foreground">
                      Paste Chain Spec JSON
                    </Label>
                    <Textarea
                      rows={6}
                      placeholder="Paste your chainspec JSON here..."
                    />
                  </div>
                )}
                {inputMethod === "upload" && (
                  <div>
                    <Label className="text-foreground">
                      Upload Chain Spec File
                    </Label>
                    <Input type="file" />
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setIsModalOpen(false)}>
                  <UploadIcon className="w-4 h-4 mr-2" />
                  Submit
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
