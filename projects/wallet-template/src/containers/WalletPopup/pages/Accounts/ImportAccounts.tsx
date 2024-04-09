import { ArrowLeft, Key, NotepadText, ChevronDown, Check } from "lucide-react"
import { rpc } from "../../api"
import { SubmitHandler, useForm, Controller } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import {
  entropyToMiniSecret,
  sr25519,
  ed25519,
  ecdsa,
  mnemonicToEntropy,
} from "@polkadot-labs/hdkd-helpers"
import { fromHex, toHex } from "@polkadot-api/utils"
import { bytesToHex } from "@noble/ciphers/utils"
import { sr25519CreateDerive } from "@polkadot-labs/hdkd"
import { networks } from "./networks"

type FormFields = {
  mnemonicInput?: string
  key?: string
  scheme: "Sr25519" | "Ed25519" | "Ecdsa"
  networks: {
    polkadot: boolean
    westend: boolean
    kusama: boolean
  }
  keysetName: string
}

type Tab = "private" | "mnemonic"

export function ImportAccounts() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>("private")
  const {
    register,
    handleSubmit,
    control,
    setValue,
    clearErrors,
    getValues,
    formState: { errors },
  } = useForm<FormFields>({
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      scheme: "Sr25519",
      networks: {
        polkadot: false,
        westend: false,
        kusama: false,
      },
    },
  })

  const onNetworkChanged = (chain: "kusama" | "polkadot" | "westend") => {
    const newValue = !getValues(`networks.${chain}`)
    return {
      ...getValues("networks"),
      [chain]: newValue,
    }
  }

  const onActiveTabChanged = (tab: Tab) => {
    setActiveTab(tab)
    clearErrors("key")
    setValue("key", "")
  }

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    switch (activeTab) {
      case "private": {
        await rpc.client.insertKeyset({
          _type: "PrivateKey",
          name: data.keysetName,
          scheme: data.scheme,
          privatekey: data.key!,
          createdAt: Date.now(),
        })
        break
      }
      case "mnemonic": {
        const entropy = mnemonicToEntropy(data.mnemonicInput!)
        const miniSecret = entropyToMiniSecret(entropy)
        // TODO: Add support for Ed25519 and Ecdsa
        const derive = sr25519CreateDerive(miniSecret)
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

        await rpc.client.insertKeyset({
          _type: "DerivationPath",
          name: data.keysetName,
          scheme: data.scheme,
          miniSecret: bytesToHex(miniSecret),
          derivationPaths,
          createdAt: Date.now(),
        })
        break
      }
    }
    window.localStorage.setItem("selectedKeysetName", data.keysetName)
    navigate("/accounts")
  }

  const validatePrivateKey = (value: string | undefined) => {
    if (!value) return "Private Key is required"

    const { scheme } = getValues()
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
      return "Invalid private format"
    }
  }

  const validateMnemonic = (value: string | undefined) => {
    if (!value) return "Mnemonic is required"

    try {
      mnemonicToEntropy(value)
      return true
    } catch (_) {
      return "Invalid mnemonic"
    }
  }

  return (
    <main className="flex flex-col items-center justify-center p-4">
      <section className="text-center w-full max-w-lg">
        <button
          className="flex items-center font-semibold"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2" /> Go Back
        </button>
        <h1 className="text-xl font-bold mt-4">Import Wallet</h1>
        <p className="text-gray-600 mt-2">
          Enter your private key or mnemonic to access your wallet
        </p>
      </section>

      <form className="mt-8 w-full max-w-lg" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex justify-center gap-4 mb-4">
          <button
            type="button"
            onClick={() => onActiveTabChanged("private")}
            className={`p-2 ${activeTab === "private" ? "font-semibold" : ""}`}
          >
            <Key className="inline-block mr-2" />
            Expanded Private Key
          </button>
          <button
            type="button"
            onClick={() => onActiveTabChanged("mnemonic")}
            className={`p-2 ${activeTab === "mnemonic" ? "font-semibold" : ""}`}
          >
            <NotepadText className="inline-block mr-2" />
            Mnemonic
          </button>
        </div>

        <div className="mb-4">
          {activeTab === "private" && (
            <>
              <label htmlFor="keyInput" className="block text-sm font-medium">
                Key
              </label>
              <input
                id="keyInput"
                placeholder={`Enter your expanded private key`}
                {...register("key", {
                  required: "Private Key is required",
                  validate: validatePrivateKey,
                })}
                className={`mt-1 p-2 w-full border ${
                  errors.key ? "border-red-500" : "border-gray-300"
                }`}
              />
            </>
          )}
          {activeTab === "mnemonic" && (
            <>
              <label
                htmlFor="mnemonicInput"
                className="block text-sm font-medium"
              >
                Key
              </label>
              <textarea
                id="mnemonicInput"
                rows={4}
                placeholder={`Enter your mnemonic`}
                {...register("mnemonicInput", {
                  required: "Mnemonic is required",
                  validate: validateMnemonic,
                })}
                className={`mt-1 p-2 w-full border ${
                  errors.key ? "border-red-500" : "border-gray-300"
                }`}
              />
            </>
          )}
          {errors.mnemonicInput && (
            <p className="text-red-500 text-xs">
              {errors.mnemonicInput.message}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label
            htmlFor="keysetNameInput"
            className="block text-sm font-medium"
          >
            Keyset Name
          </label>
          {
            <input
              id="keysetNameInput"
              placeholder={`Enter a keyset name`}
              {...register("keysetName", {
                required: "keysetName is required",
              })}
              className={`mt-1 p-2 w-full border ${
                errors.keysetName ? "border-red-500" : "border-gray-300"
              }`}
            />
          }
        </div>

        <div className="mb-4">
          <label
            htmlFor="scheme"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Scheme
          </label>
          <Controller
            name="scheme"
            control={control}
            render={({ field }) => (
              <div className="relative">
                <select
                  {...field}
                  id="scheme"
                  className="block w-full appearance-none bg-white border border-gray-300 text-base rounded-md py-2 pl-3 pr-10 hover:border-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  aria-label="Select cryptography"
                  aria-expanded="true"
                >
                  <option value="Sr25519">Sr25519</option>
                  <option value="Ed25519">Ed25519</option>
                  <option value="Ecdsa">Ecdsa</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDown />
                </div>
              </div>
            )}
          />
        </div>

        {activeTab === "mnemonic" && (
          <div className="mb-4">
            <fieldset className="p-4 border-2 border-gray-200 rounded-lg">
              <legend className="font-semibold">Networks</legend>
              <Controller
                name="networks"
                control={control}
                rules={{
                  validate: (value) =>
                    Object.values(value).some((v) => v) ||
                    "At least one option must be selected.",
                }}
                render={({ field }) => (
                  <div className="flex flex-col gap-4">
                    {(["polkadot", "westend", "kusama"] as const).map(
                      (chain, idx) => (
                        <label
                          htmlFor={chain}
                          key={idx}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            id={chain}
                            type="checkbox"
                            checked={field.value[chain]}
                            onChange={() =>
                              field.onChange(onNetworkChanged(chain))
                            }
                            className="appearance-none h-6 w-6 border-2 border-gray-300 rounded-sm checked:border-blue-500 focus:outline-none cursor-pointer"
                            aria-checked={field.value[chain]}
                          />
                          {field.value[chain] && (
                            <Check
                              className="absolute text-blue-500"
                              size={24}
                            />
                          )}
                          <span className="text-sm">
                            {chain.charAt(0).toUpperCase() + chain.slice(1)}
                          </span>
                        </label>
                      ),
                    )}
                  </div>
                )}
              />
            </fieldset>
            {errors.networks && (
              <p className="text-red-500 mt-2">{errors.networks.message}</p>
            )}
          </div>
        )}

        <button
          type="submit"
          className="w-full p-3 bg-blue-500 text-white disabled:opacity-50"
        >
          Import Wallet
        </button>
      </form>

      {/* This is where you'd display error messages from the import process */}
      {/* Example: <p className="text-red-500">Error importing wallet</p> */}
    </main>
  )
}
