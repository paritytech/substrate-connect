import { Key, NotepadText, ChevronDown } from "lucide-react"
import { rpc } from "../../api"
import { SubmitHandler, useForm, Controller } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import {
  entropyToMiniSecret,
  sr25519,
  ed25519,
  ecdsa,
  mnemonicToEntropy,
} from "@polkadot-labs/hdkd-helpers"
import { fromHex, toHex } from "@polkadot-api/utils"
import { bytesToHex } from "@noble/ciphers/utils"
import {
  CreateDeriveFn,
  ecdsaCreateDerive,
  ed25519CreateDerive,
  sr25519CreateDerive,
} from "@polkadot-labs/hdkd"
import { networks } from "./networks"
import { Layout2 } from "@/components/Layout2"
import { BottomNavBar, Header } from "../../components"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"

const createDeriveFnMap: Record<Scheme, CreateDeriveFn> = {
  Sr25519: sr25519CreateDerive,
  Ed25519: ed25519CreateDerive,
  Ecdsa: ecdsaCreateDerive,
}

type Scheme = "Sr25519" | "Ed25519" | "Ecdsa"

type Tab =
  | {
      _type: "mnemonic"
      mnemonic: string
    }
  | {
      _type: "privateKey"
      privateKey: string
    }

type FormFields = {
  cryptoKeyName: string
  scheme: Scheme
  tab: Tab
  networks: {
    polkadot: boolean
    westend: boolean
    kusama: boolean
  }
}

const validatePrivateKey = (value: string | undefined, scheme: string) => {
  if (!value) return "Private Key is required."

  const bytes = fromHex(value)
  try {
    switch (scheme) {
      case "Ecdsa":
        ecdsa.getPublicKey(bytes)
        break
      case "Ed25519":
        ed25519.getPublicKey(bytes)
        break
      case "Sr25519":
        sr25519.getPublicKey(bytes)
        break
    }
    return true
  } catch (_) {
    return "Invalid private key."
  }
}

const validateMnemonic = (value: string | undefined) => {
  if (!value) return "Mnemonic is required."

  try {
    mnemonicToEntropy(value)
    return true
  } catch (_) {
    return "Invalid mnemonic."
  }
}

export function ImportAccounts() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    control,
    setValue,
    clearErrors,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      scheme: "Sr25519",
      tab: {
        _type: "privateKey",
        privateKey: "",
      },
      networks: {
        polkadot: false,
        westend: false,
        kusama: false,
      },
    },
  })

  const activeTab = watch("tab._type")

  const onNetworkChanged = (chain: "kusama" | "polkadot" | "westend") => {
    const newValue = !getValues(`networks.${chain}`)
    console.log("?????")
    return {
      ...getValues("networks"),
      [chain]: newValue,
    }
  }

  const onActiveTabChanged = (tab: Tab["_type"]) => {
    clearErrors()
    setValue("tab._type", tab)
  }

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    switch (data.tab._type) {
      case "privateKey": {
        await rpc.client.insertCryptoKey({
          type: "Keypair",
          name: data.cryptoKeyName,
          scheme: data.scheme,
          privatekey: data.tab.privateKey!,
          createdAt: Date.now(),
        })
        break
      }
      case "mnemonic": {
        const entropy = mnemonicToEntropy(data.tab.mnemonic!)
        const miniSecret = entropyToMiniSecret(entropy)
        const derive = createDeriveFnMap[data.scheme](miniSecret)
        const derivationPaths = Object.entries(data.networks)
          .filter(([_, selected]) => selected)
          .map(([networkId, _]) => {
            const network = networks.find(
              ({ label }) => networkId.toLowerCase() === label.toLowerCase(),
            )!
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
          scheme: data.scheme,
          miniSecret: bytesToHex(miniSecret),
          derivationPaths,
          createdAt: Date.now(),
        })
        break
      }
    }
    window.localStorage.setItem("selectedCryptoKeyName", data.cryptoKeyName)
    navigate("/accounts")
  }

  return (
    <Layout2>
      <Header />
      <section className="w-full max-w-lg text-center">
        <h1 className="mt-4 text-xl font-bold">Import Crypto Key</h1>
      </section>

      <ScrollArea className="grow">
        <form
          className="w-full max-w-lg px-6 mt-8 mb-4 sm:px-8"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex justify-center gap-4 mb-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onActiveTabChanged("privateKey")}
              className={`p-2 ${activeTab === "privateKey" ? "font-semibold" : ""}`}
            >
              <Key className="inline-block mr-2" />
              Expanded Private Key
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onActiveTabChanged("mnemonic")}
              className={`p-2 ${activeTab === "mnemonic" ? "font-semibold" : ""}`}
            >
              <NotepadText className="inline-block mr-2" />
              Mnemonic
            </Button>
          </div>

          <div className="mb-4">
            {activeTab === "privateKey" && (
              <Controller
                control={control}
                name="tab.privateKey"
                rules={{
                  required: "Private Key is required.",
                  validate: (value) =>
                    validatePrivateKey(value, getValues("scheme")),
                }}
                render={({ field, fieldState: { error } }) => (
                  <>
                    <Label htmlFor="privateKeyInput">Private Key</Label>
                    <Input
                      {...field}
                      id="privateKeyInput"
                      placeholder="Enter your expanded private key"
                      {...register("tab.privateKey", {
                        required: "Private Key is required.",
                        validate: (value) =>
                          validatePrivateKey(value, getValues("scheme")),
                      })}
                      className={`mt-1 ${error?.message ? "border-destructive" : "border-input"}`}
                    />
                    {error?.message && (
                      <p className="text-xs text-destructive">
                        {error.message}
                      </p>
                    )}
                  </>
                )}
              />
            )}
            {activeTab === "mnemonic" && (
              <Controller
                control={control}
                name="tab.mnemonic"
                rules={{
                  required: "Private Key is required.",
                  validate: (value) =>
                    validatePrivateKey(value, getValues("scheme")),
                }}
                render={({ field, fieldState: { error } }) => (
                  <>
                    <Label htmlFor="mnemonicInput">Mnemonic</Label>
                    <Textarea
                      {...field}
                      id="mnemonicInput"
                      rows={4}
                      placeholder="Enter your mnemonic"
                      {...register("tab.mnemonic", {
                        required: "Mnemonic is required.",
                        validate: validateMnemonic,
                      })}
                      className={`mt-1 ${error?.message ? "border-destructive" : "border-input"}`}
                    />
                    {error?.message && (
                      <p className="text-xs text-destructive">
                        {error.message}
                      </p>
                    )}
                  </>
                )}
              />
            )}
          </div>

          <div className="mb-4">
            <Label htmlFor="cryptoKeyInput">Crypto Key Name</Label>
            <Input
              id="cryptoKeyInput"
              placeholder={`Enter a crypto key name`}
              {...register("cryptoKeyName", {
                required: "Crypto Key Name is required.",
              })}
              className={`mt-1 ${errors.cryptoKeyName ? "border-destructive" : "border-input"}`}
            />
            {errors?.cryptoKeyName?.message && (
              <p className="text-xs text-destructive">
                {errors?.cryptoKeyName.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <Label htmlFor="scheme">Scheme</Label>
            <Controller
              name="scheme"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <select
                    {...field}
                    id="scheme"
                    className="block w-full py-2 pl-3 pr-10 text-base bg-white border border-gray-300 rounded-md appearance-none hover:border-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    aria-label="Select cryptography"
                    aria-expanded="true"
                  >
                    <option value="Sr25519">Sr25519</option>
                    <option value="Ed25519">Ed25519</option>
                    <option value="Ecdsa">Ecdsa</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 pointer-events-none">
                    <ChevronDown />
                  </div>
                </div>
              )}
            />
          </div>

          {activeTab === "mnemonic" && (
            <div className="mb-4">
              <fieldset className="p-4 border-2 border-border rounded-radius">
                <legend className="font-semibold">Networks</legend>
                <Controller
                  name="networks"
                  control={control}
                  rules={{
                    validate: (value) =>
                      Object.values(value).some((v) => v) ||
                      "At least one network must be selected.",
                  }}
                  render={({ field }) => (
                    <div className="flex flex-col gap-4">
                      {(["polkadot", "westend", "kusama"] as const).map(
                        (chain, idx) => (
                          <>
                            <div
                              className="flex items-center space-x-2"
                              key={idx}
                            >
                              <Checkbox
                                id={chain}
                                checked={field.value[chain]}
                                onCheckedChange={() =>
                                  field.onChange(onNetworkChanged(chain))
                                }
                                aria-checked={field.value[chain]}
                              />
                              <label
                                htmlFor={chain}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                <span className="text-sm">
                                  {chain.charAt(0).toUpperCase() +
                                    chain.slice(1)}
                                </span>
                              </label>
                            </div>
                          </>
                        ),
                      )}
                    </div>
                  )}
                />
              </fieldset>
              {errors.networks && (
                <p className="mt-2 text-destructive">
                  {errors.networks.message}
                </p>
              )}
            </div>
          )}

          <Button
            type="submit"
            className="w-full disabled:opacity-50"
            disabled={isSubmitting}
          >
            Import Wallet
          </Button>
        </form>
      </ScrollArea>
      <BottomNavBar currentItem="import" />
    </Layout2>
  )
}
