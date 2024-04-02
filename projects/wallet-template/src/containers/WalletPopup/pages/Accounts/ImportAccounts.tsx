import { ArrowLeft, Key, Lock } from "lucide-react"
import useSWR from "swr"
import { rpc } from "../../api"
import { SubmitHandler, useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

type FormFields = {
  key: string
  keysetName: string
}

export function ImportAccounts() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("private")
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormFields>({
    mode: "onChange",
  })
  const { data: keysets } = useSWR(
    "rpc.getKeysets",
    () => rpc.client.getKeysets(),
    {
      revalidateOnFocus: true,
    },
  )

  const keysetNames = keysets?.map((keyset) => keyset.name) ?? []
  const onSubmit: SubmitHandler<FormFields> = (data) => {
    console.log(data)
    // Here you would typically handle the import wallet process
  }

  const validateKey = (value: string) => {
    return /^(0x)?[0-9a-fA-F]{64,66}$/.test(value) || "Invalid key format"
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
          Enter your private or public key to access your wallet
        </p>
      </section>

      <form className="mt-8 w-full max-w-lg" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex justify-center gap-4 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab("private")}
            className={`p-2 ${activeTab === "private" ? "font-semibold" : ""}`}
          >
            <Key className="inline-block mr-2" />
            Private Key
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("public")}
            className={`p-2 ${activeTab === "public" ? "font-semibold" : ""}`}
          >
            <Lock className="inline-block mr-2" />
            Public Key
          </button>
        </div>

        <div className="mb-4">
          <label htmlFor="keyInput" className="block text-sm font-medium">
            Key
          </label>
          <input
            id="keyInput"
            placeholder="Enter your private or public key"
            {...register("key", {
              required: "Key is required",
              validate: validateKey,
            })}
            className={`mt-1 p-2 w-full border ${
              errors.key ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.key && (
            <p className="text-red-500 text-xs">{errors.key.message}</p>
          )}
        </div>

        <div className="mb-6">
          <label
            htmlFor="keysetNameInput"
            className="block text-sm font-medium"
          >
            Keyset Name
          </label>
          {keysetNames.length > 0 ? (
            <>
              <select
                id="keysetNameInput"
                {...register("keysetName")}
                className="mt-1 p-2 w-full border border-gray-300"
              >
                {keysetNames.map((keyset, index) => (
                  <option value={keyset} key={index}>
                    {keyset}
                  </option>
                ))}
              </select>
              {errors.keysetName && (
                <p className="text-red-500 text-xs">
                  {errors.keysetName.message}
                </p>
              )}
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="Enter a name for this keyset"
                className={`mt-1 p-2 w-full border ${
                  errors.keysetName ? "border-red-500" : "border-gray-300"
                }`}
                id="keysetName"
                {...register("keysetName")}
              />
              {errors.keysetName && (
                <p className="text-red-500 text-xs">
                  {errors.keysetName.message}
                </p>
              )}
            </>
          )}
        </div>

        <button
          type="submit"
          disabled={!isValid}
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
