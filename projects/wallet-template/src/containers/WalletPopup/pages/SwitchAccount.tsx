import { User } from "lucide-react"
import React, { useEffect, useState } from "react"
import useSWR from "swr"
import { rpc } from "../api"
import { useNavigate } from "react-router-dom"
import { RadioGroup } from "@headlessui/react"

type AccountTabProps = {
  keysetName: string
}

const AccountTab: React.FC<AccountTabProps> = ({ keysetName }) => {
  return (
    <div
      className="p-2 rounded-lg hover:bg-gray-50 flex items-center cursor-pointer"
      tabIndex={0}
    >
      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
        <User className="text-gray-600" />
      </div>
      <div>
        <p className="text-gray-800">{keysetName}</p>
      </div>
    </div>
  )
}

export const SwitchAccount: React.FC = () => {
  const { data: keysets, isLoading } = useSWR("/rpc/keysets", async () => {
    return rpc.client.listKeysets()
  })
  const [selectedKeyset, setSelectedKeyset] = useState<string>()

  const keysetNames = Object.keys(keysets ?? {})

  return (
    <main className="p-4">
      <div className="max-w-xl p-6 mx-auto bg-white rounded-lg shadow-lg">
        <h1 className="mb-4 text-2xl font-bold">Switch Account</h1>
        <RadioGroup value={selectedKeyset} onChange={setSelectedKeyset}>
          <RadioGroup.Label className="sr-only">Keyset</RadioGroup.Label>
          <div className="space-y-2">
            {keysetNames.map((keysetName) => (
              <RadioGroup.Option
                key={keysetName}
                value={keysetName}
                className={({ active, checked }) =>
                  `${
                    active
                      ? "ring-2 ring-white/60 ring-offset-2 ring-offset-black"
                      : ""
                  }
                  ${checked ? "bg-black/75 text-white" : "bg-white"}
                    relative flex cursor-pointer rounded-lg px-5 py-4 shadow-md focus:outline-none`
                }
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                  <User className="text-gray-600" />
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-lg">{keysetName}</span>
                </div>
              </RadioGroup.Option>
            ))}
          </div>
        </RadioGroup>
        <div className="mt-6">
          <button className="w-full bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600 transition-colors">
            Switch
          </button>
        </div>
      </div>
    </main>
  )
}
