import { User } from "lucide-react"
import React, { useEffect, useState } from "react"
import { rpc } from "../../api"
import { RadioGroup } from "@headlessui/react"
import { SubmitHandler, useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import useSWR from "swr"
import { Layout } from "../../../../components/Layout"

export const SwitchAccount: React.FC = () => {
  const navigate = useNavigate()

  const { data: cryptoKeys } = useSWR(
    "rpc.getCryptoKeys",
    () => rpc.client.getCryptoKeys(),
    {
      revalidateOnFocus: true,
    },
  )

  const [selectedCryptoKeyName, setSelectedCryptoKeyName] = useState<string>("")
  const { handleSubmit } = useForm()

  useEffect(() => {
    if (cryptoKeys && selectedCryptoKeyName === "") {
      setSelectedCryptoKeyName(
        () =>
          window.localStorage.getItem("selectedCryptoKeyName") ??
          cryptoKeys[0].name,
      )
    }
  }, [selectedCryptoKeyName, cryptoKeys])

  const onSubmit: SubmitHandler<Record<string, any>> = async () => {
    try {
      if (!cryptoKeys) return
      window.localStorage.setItem(
        "selectedCryptoKeyName",
        selectedCryptoKeyName,
      )
    } finally {
      navigate("/accounts")
    }
  }

  const cryptoKeyNames = cryptoKeys?.map(({ name }) => name) ?? []
  return (
    <Layout>
      <form className="max-w-xl p-6 mx-auto" onSubmit={handleSubmit(onSubmit)}>
        <h1 className="mb-4 text-2xl font-bold">Switch Account</h1>
        <RadioGroup
          value={selectedCryptoKeyName}
          onChange={setSelectedCryptoKeyName}
        >
          <RadioGroup.Label className="sr-only">Crypto Key</RadioGroup.Label>
          <div className="space-y-2">
            {cryptoKeyNames.map((name) => (
              <RadioGroup.Option
                key={name}
                value={name}
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
                  <span className="text-lg">{name}</span>
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
      </form>
    </Layout>
  )
}
