import { ArrowRight, CheckCircle, Copy } from "lucide-react"
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
import { StepIndicator } from "../../components"
import useSWR from "swr"
import { sr25519CreateDerive } from "@polkadot-labs/hdkd"

type FormFields = {
  keysetName: string
  networks: string[]
}

export const AddAccount = () => {
  const navigate = useNavigate()
  const [mnemonic, _] = useState(generateMnemonic(256).split(" "))
  const { data: keysets, isLoading: isKeysetsLoading } = useSWR(
    "/rpc/keysets",
    async () => {
      return rpc.client.listKeysets()
    },
  )

  // HACK: work around for double submit
  const [isSubmitted, setIsSubmitted] = useState(false)

  const {
    handleSubmit,
    trigger,
    formState: { isSubmitting, errors },
    getValues,
    setValue,
    register,
    watch,
  } = useForm<FormFields>()

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    if (!isSubmitted) {
      return
    }

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

      await rpc.client.insertKeyset(data.keysetName, {
        scheme: "Sr25519",
        derivationPaths,
      })
    } finally {
      navigate("/accounts")
    }
  }

  register("networks", {
    required: "You must select at least one network",
    validate: (v) => v.length > 0,
  })

  const [currentStep, setCurrentStep] = useState(1)
  const nextStep = async () => {
    switch (currentStep) {
      case 1:
        if (!(await trigger("keysetName"))) return
        break
      case 2:
        if (!(await trigger("networks"))) return
        break
      default:
        break
    }
    setCurrentStep((prevStep) => Math.min(prevStep + 1, 3))
  }

  const prevStep = () => {
    setIsSubmitted(false)
    setCurrentStep((prevStep) => Math.max(prevStep - 1, 1))
  }

  const toggleNetwork = (network: string) => {
    const prev = getValues("networks") ?? []
    setValue(
      "networks",
      prev.includes(network)
        ? prev.filter((n) => n !== network)
        : [...prev, network],
    )
  }

  const selectedNetworks = watch("networks", [])

  const StepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h2 className="mb-2 text-lg font-semibold">Set Keyset Name</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter keyset name"
                className="block w-full px-4 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                {...register("keysetName", {
                  required: "You must specify a keyset name",
                  validate: (v) =>
                    (keysets && keysets[v] === undefined) ||
                    "Keyset already exists",
                  minLength: {
                    value: 1,
                    message: "Keyset must have at least 1 character",
                  },
                })}
              />
              {errors.keysetName && (
                <div className="text-red-500">{errors.keysetName.message}</div>
              )}
            </div>
          </div>
        )
      case 2:
        return (
          <div>
            <section aria-label="Network selection" className="mb-6">
              <h2 className="mb-4 text-lg font-semibold">Select Network</h2>
              <div className="flex flex-col gap-4">
                {networks.map((network) => (
                  <label
                    key={network.label}
                    className="flex items-center justify-start p-4 transition-colors bg-gray-200 rounded-lg cursor-pointer hover:bg-gray-300"
                  >
                    <div className="relative mr-4">
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={selectedNetworks.includes(network.value)}
                        onChange={() => toggleNetwork(network.value)}
                      />
                      {selectedNetworks.includes(network.value) ? (
                        <CheckCircle size="20" />
                      ) : (
                        <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
                      )}
                    </div>
                    <span className="flex items-center gap-2 font-medium text-gray-700">
                      <img
                        src={network.logo}
                        alt={`${network.label} Logo`}
                        className="w-5 h-5 mr-2"
                      />
                      {network.label}
                    </span>
                  </label>
                ))}
              </div>
              {errors.networks && (
                <div className="text-red-500">{errors.networks.message}</div>
              )}
            </section>
          </div>
        )
      case 3:
        return (
          <div>
            <h1 className="mb-4 text-2xl text-white">Your Seed Phrase</h1>
            <p className="mb-6 text-lg">
              Make sure you save these words in the correct order and keep them
              somewhere safe.
            </p>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {mnemonic.map((word, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-700 rounded"
                >
                  <span className="text-gray-300">
                    {index + 1}. {word}
                  </span>
                  <button
                    type="button"
                    aria-label={`Copy word ${index + 1}`}
                    className="text-white"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <main className="p-4">
      <div className="max-w-md p-6 mx-auto bg-white rounded-lg shadow-lg">
        <h1 className="mb-4 text-2xl font-bold">Create A New Keyset</h1>
        <StepIndicator currentStep={currentStep} steps={3} />
        <form className="mt-4" onSubmit={handleSubmit(onSubmit)}>
          <StepContent />
          <div className="flex justify-between mt-6">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 text-gray-800 bg-gray-200 rounded hover:bg-gray-300"
              >
                Back
              </button>
            )}
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center px-4 py-2 text-white bg-teal-500 rounded hover:bg-teal-600"
                disabled={isKeysetsLoading || isSubmitting}
              >
                Next <ArrowRight size="16" className="ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                className="flex items-center px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
                disabled={isSubmitting}
                onClick={() => setIsSubmitted(true)}
              >
                Submit <CheckCircle size="16" className="ml-2" />
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  )
}
