import { User } from "lucide-react"
import React, { useEffect, useState } from "react"
import useSWR, { useSWRConfig } from "swr"
import { rpc } from "../../api"
import { RadioGroup } from "@headlessui/react"
import { SubmitHandler, useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"

export const SwitchAccount: React.FC = () => {
  const navigate = useNavigate()

  const { mutate } = useSWRConfig()
  const { data: keysets } = useSWR(
    "/rpc/keysets",
    () => rpc.client.listKeysets(),
    { revalidateOnFocus: true },
  )

  const [selectedKeysetName, setSelectedKeysetName] = useState<string>("")
  const { handleSubmit } = useForm()

  useEffect(() => {
    ;(async () => {
      const primaryKeysetName = await rpc.client.getPrimaryKeysetName()
      if (primaryKeysetName && keysets?.[primaryKeysetName]) {
        setSelectedKeysetName(primaryKeysetName)
      }
    })()
  }, [keysets])

  const onSubmit: SubmitHandler<Record<string, any>> = async () => {
    try {
      await rpc.client.setPrimaryKeysetName(selectedKeysetName)
      await mutate("/rpc/primaryKeysetName")
    } finally {
      navigate("/accounts")
    }
  }

  const keysetNames = Object.keys(keysets ?? {})

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4">
      <div className="max-w-xl p-6 mx-auto bg-white rounded-lg shadow-lg">
        <h1 className="mb-4 text-2xl font-bold">Switch Account</h1>
        <RadioGroup value={selectedKeysetName} onChange={setSelectedKeysetName}>
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
          <button
            type="submit"
            className="w-full bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600 transition-colors"
          >
            Switch
          </button>
        </div>
      </div>
    </form>
  )
}
