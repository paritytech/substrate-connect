import { ArrowLeftIcon, ArrowRightIcon, CheckCircleIcon } from "lucide-react"
import { useState } from "react"
import {
  entropyToMiniSecret,
  generateMnemonic,
  mnemonicToEntropy,
} from "@polkadot-labs/hdkd-helpers"
import { networks } from "./networks"
import { SubmitHandler, useForm } from "react-hook-form"
import { toHex } from "@polkadot-api/utils"
import { useNavigate } from "react-router-dom"
import { rpc } from "../../api"
import { sr25519CreateDerive } from "@polkadot-labs/hdkd"
import { bytesToHex } from "@noble/ciphers/utils"
import { z } from "zod"
import { Layout2 } from "@/components/Layout2"
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Header, BottomNavBar } from "../../components"
import { zodResolver } from "@hookform/resolvers/zod"
import { ScrollArea } from "@/components/ui/scroll-area"

const schema = z.object({
  cryptoKeyName: z
    .string({ required_error: "This field is required." })
    .min(1, "This field cannot be empty.")
    .refine(
      async (name) => {
        const existingKeys = (await rpc.client.getCryptoKeys()).map(
          (key) => key.name,
        )
        return !existingKeys.includes(name)
      },
      {
        message: "Name already exists",
      },
    ),
  networks: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You must to select at least one network.",
  }),
  seedPhraseConfirmed: z.boolean().refine((value) => value, {
    message: "You must confirm the seed phrase.",
  }),
})

export const AddAccount = () => {
  const navigate = useNavigate()
  const [mnemonic, _] = useState(generateMnemonic(256).split(" "))

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      cryptoKeyName: "",
      networks: [],
      seedPhraseConfirmed: false,
    },
  })
  const {
    handleSubmit,
    control,
    trigger,
    formState: { isSubmitting },
  } = form

  const onSubmit: SubmitHandler<z.infer<typeof schema>> = async (data) => {
    try {
      const entropy = mnemonicToEntropy(mnemonic.join(" "))
      const miniSecret = entropyToMiniSecret(entropy)
      const derive = sr25519CreateDerive(miniSecret)
      const selectedNetworks = data.networks.map(
        (network) => networks.find(({ value }) => network === value)!,
      )
      const derivationPaths = selectedNetworks.map((network) => {
        const path = `//${network.value}//0`
        return {
          chainId: network.chainId,
          path,
          publicKey: toHex(derive(`//${network.value}//0`).publicKey),
        }
      })

      await rpc.client.insertCryptoKey({
        type: "Keyset",
        name: data.cryptoKeyName,
        scheme: "Sr25519",
        createdAt: Date.now(),
        miniSecret: bytesToHex(miniSecret),
        derivationPaths,
      })
      window.localStorage.setItem("selectedCryptoKeyName", data.cryptoKeyName)
    } finally {
      navigate("/accounts")
    }
  }

  const [step, setStep] = useState(1)
  const handleNext = async () => {
    switch (step) {
      case 1:
        if (!(await trigger("cryptoKeyName"))) return
        break
      case 2:
        if (!(await trigger("networks"))) return
        break
      default:
        break
    }
    setStep((prevStep) => Math.min(prevStep + 1, 3))
  }

  const handleBack = () => {
    setStep((prevStep) => Math.max(prevStep - 1, 1))
  }

  return (
    <Layout2>
      <div className="flex flex-col justify-between h-full">
        <Header />
        <ScrollArea className="grow">
          <Form {...form}>
            <form
              className="relative h-full grow"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="h-full max-w-lg mx-auto bg-card text-card-foreground">
                <CardHeader className="mb-4">
                  <CardTitle className="text-center">
                    {step === 1
                      ? "Choose Name"
                      : step === 2
                        ? "Choose Networks"
                        : "Review Seed Phrase"}
                  </CardTitle>
                  <CardDescription className="text-center text-muted-foreground">
                    Step {step} of 3
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {step === 1 && (
                    <div className="step-1">
                      <FormField
                        name="cryptoKeyName"
                        control={control}
                        render={({ field }) => (
                          <FormItem>
                            <FormDescription className="mb-4 text-xs">
                              Set a name for your crypto key. This name will be
                              used to identify your crypto key within the
                              extension.
                            </FormDescription>
                            <Separator className="mb-4" />
                            <FormLabel
                              htmlFor="cryptoKeyName"
                              className="block mb-2 text-muted-foreground"
                            >
                              Crypto Key Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                id="cryptoKeyName"
                                type="text"
                                className="w-full bg-input text-card-foreground"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                  {step === 2 && (
                    <div className="step-2">
                      <FormField
                        name="networks"
                        control={control}
                        render={() => (
                          <FormItem>
                            <FormDescription className="mb-4 text-xs">
                              Select the blockchain networks you want your
                              wallet to support
                            </FormDescription>
                            <Separator className="mb-4" />
                            {networks.map((network) => (
                              <FormField
                                key={network.chainId}
                                control={control}
                                name="networks"
                                render={({ field }) => (
                                  <FormItem
                                    key={network.chainId}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <>
                                        <img
                                          src={network.logo}
                                          alt={`${network.label} Logo`}
                                          className="w-5 h-5"
                                        />
                                        <Checkbox
                                          checked={field.value?.includes(
                                            network.value,
                                          )}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([
                                                  ...field.value,
                                                  network.value,
                                                ])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) =>
                                                      value !== network.value,
                                                  ),
                                                )
                                          }}
                                        />
                                      </>
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {network.label}
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />
                            ))}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                  {step === 3 && (
                    <div className="step-3">
                      <FormField
                        name="seedPhraseConfirmed"
                        control={control}
                        render={({ field }) => (
                          <FormItem>
                            <FormDescription className="mb-4 text-xs">
                              Your seed phrase is a unique set of words that you
                              need to back up and recover your wallet. Do not
                              share this with anyone.
                            </FormDescription>
                            <Separator className="mb-4" />
                            <div className="p-4 mb-4 border rounded-md border-border bg-muted">
                              {mnemonic.join(" ")}
                            </div>
                            <div className="flex">
                              <FormControl className="mr-2">
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <Label className="block text-muted-foreground">
                                I have written down my seed phrase.
                              </Label>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between mt-6">
                  {step > 1 && (
                    <Button
                      type="button"
                      onClick={handleBack}
                      className="flex items-center space-x-2 border-border text-card-foreground"
                      variant="outline"
                    >
                      <ArrowLeftIcon className="w-4 h-4" />
                      <span>Back</span>
                    </Button>
                  )}
                  {step < 3 ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="flex items-center ml-auto space-x-2 bg-primary text-primary-foreground hover:bg-primary-dark"
                    >
                      <span>Next</span>
                      <ArrowRightIcon className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center ml-auto space-x-2 bg-primary text-primary-foreground hover:bg-primary-dark"
                      variant="default"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>Finish</span>
                    </Button>
                  )}
                </CardFooter>
              </div>
            </form>
          </Form>
        </ScrollArea>
        <BottomNavBar currentItem="add" />
      </div>
    </Layout2>
  )
}
