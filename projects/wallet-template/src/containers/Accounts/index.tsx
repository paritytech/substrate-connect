import { ArrowRight, CheckCircle, Copy } from "lucide-react"
import { useEffect, useState } from "react"
import { StepIndicator } from "../../components"
import { generateMnemonic } from "@polkadot-labs/hdkd-helpers"

type Network = {
  label: string
  value: string
  logo: string
}

const networks: Network[] = [
  {
    value: "polkadot",
    label: "Polkadot",
    logo: "https://cryptologos.cc/logos/polkadot-new-dot-logo.svg",
  },
  {
    value: "westend2",
    label: "Westend",
    logo: "https://i.imgur.com/Dwb1yMS.png",
  },
  {
    value: "ksmcc3",
    label: "Kusama",
    logo: "https://cryptologos.cc/logos/kusama-ksm-logo.svg",
  },
  {
    value: "polkadot_asset_hub",
    label: "Polkadot Asset Hub",
    logo: "https://i.imgur.com/Vu3xpq2.png",
  },
  {
    value: "westend_asset_hub",
    label: "Westend Asset Hub",
    logo: "https://i.imgur.com/RkU4UQQ.png",
  },
  {
    value: "kusama_asset_hub",
    label: "Kusama Asset Hub",
    logo: "https://i.imgur.com/Q1bH3U9.png",
  },
]

export const Accounts = () => {
  const [mnemonic, _] = useState(generateMnemonic(256).split(" "))

  const [selectedNetworks, setSelectedNetworks] = useState<string[]>([])

  const toggleNetwork = (network: string) => {
    setSelectedNetworks((prev) =>
      prev.includes(network)
        ? prev.filter((n) => n !== network)
        : [...prev, network],
    )
  }

  const [currentStep, setCurrentStep] = useState(1)
  const nextStep = () => {
    setCurrentStep((prevStep) => Math.min(prevStep + 1, 3))
  }

  const prevStep = () => {
    setCurrentStep((prevStep) => Math.max(prevStep - 1, 1))
  }

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
              />
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
                        checked={selectedNetworks.includes(network.label)}
                        onChange={() => toggleNetwork(network.label)}
                      />
                      {selectedNetworks.includes(network.label) ? (
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
        <h1 className="mb-4 text-2xl font-bold">Create A Wallet</h1>
        <StepIndicator currentStep={currentStep} steps={3} />
        <form
          className="mt-4"
          onSubmit={(e) => {
            e.preventDefault()
          }}
        >
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
                className="flex items-center px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
              >
                Next <ArrowRight size="16" className="ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                className="flex items-center px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
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
