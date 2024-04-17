import { Clipboard, CheckCircle, ArrowLeft } from "lucide-react"
import React, { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useCopyToClipboard } from "usehooks-ts"

export const AccountDetails: React.FC = () => {
  const navigate = useNavigate()
  const { accountId } = useParams<{ accountId: string }>()
  const [copied, setCopied] = useState(false)
  const [_, copy] = useCopyToClipboard()

  if (!accountId) {
    return null
  }

  const onCopyToClipboard = async () => {
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
    }, 2000)
    await copy(accountId)
  }

  return (
    <section
      aria-label="Account Details"
      className="mb-8 mx-auto bg-white shadow rounded-lg"
    >
      <section className="text-center w-full max-w-lg">
        <button
          className="flex items-center font-semibold"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2" /> Go Back
        </button>
        <h1 className="text-3xl font-semibold text-center p-4 border-b">
          Account Details
        </h1>
      </section>

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Wallet Address</h2>
          <button
            type="button"
            className={`p-2 rounded flex items-center justify-center space-x-2 ${copied ? "bg-green-200" : ""}`}
            aria-label="Copy to clipboard"
            onClick={onCopyToClipboard}
          >
            {copied ? (
              <div className="flex items-center space-x-2">
                <CheckCircle className="text-green-500" size={24} />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Clipboard size={24} />
              </div>
            )}
          </button>
        </div>
        <p className="text-xs mb-4 bg-gray-200 p-3 rounded text-center">
          {accountId?.toUpperCase()}
        </p>
      </div>
    </section>
  )
}
