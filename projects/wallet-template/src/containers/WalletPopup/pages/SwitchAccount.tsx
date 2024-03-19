import { User } from "lucide-react"
import React, { useEffect } from "react"
import useSWR from "swr"
import { rpc } from "../api"
import { useNavigate } from "react-router-dom"

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

export const SwitchAccount: React.FC<{}> = () => {
  const navigate = useNavigate()
  const { data: keysets, isLoading } = useSWR("/rpc/keysets", async () => {
    return rpc.client.listKeysets()
  })

  useEffect(() => {
    if (!isLoading && !keysets) {
      navigate("/accounts")
    }
  }, [keysets, isLoading, navigate])

  const keysetNames = Object.keys(keysets ?? {})

  useEffect(() => {
    console.log("keysets", keysets)
  }, [keysets])

  return (
    <main className="p-4">
      <div className="max-w-xl p-6 mx-auto bg-white rounded-lg shadow-lg">
        <h1 className="mb-4 text-2xl font-bold">Switch Account</h1>
        <div className="space-y-4">
          {keysetNames.map((keysetName) => (
            <AccountTab keysetName={keysetName} />
          ))}
        </div>
        <div className="mt-6">
          <button className="w-full bg-teal-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
            Switch
          </button>
        </div>
      </div>
    </main>
  )
}
