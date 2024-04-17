import { Globe, Clipboard } from "lucide-react"
import React from "react"

export const AccountDetails: React.FC = () => {
  return (
    <section
      aria-label="Account Details"
      className="mb-8 mx-auto bg-white shadow rounded-lg"
    >
      <h1 className="text-3xl font-semibold text-center p-4 border-b">
        Account Details
      </h1>

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Wallet Address</h2>
          <Clipboard className="cursor-pointer text-gray-500 hover:text-gray-700" />
        </div>
        <p className="text-sm mb-4 bg-gray-200 p-3 rounded text-center">
          5FFMCdRt2GsEcrG5WJCKtXQ8nnpLTe3jrio3YS3JFeS5vzJb
        </p>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Networks</h3>
            <div className="mt-2 flex items-center">
              <Globe className="mr-2" size={20} />
              <p className="text-lg">Polkadot</p>
            </div>
            <div className="mt-2 flex items-center">
              <Globe className="mr-2" size={20} />
              <p className="text-lg">Westend</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
