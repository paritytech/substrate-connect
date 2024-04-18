import { ArrowLeft, ClipboardCheck, ClipboardCopyIcon } from "lucide-react"
import * as clipboard from "@zag-js/clipboard"
import { useMachine, normalizeProps } from "@zag-js/react"
import React, { useId } from "react"
import { useParams, useNavigate } from "react-router-dom"

export const AccountDetails: React.FC = () => {
  const navigate = useNavigate()
  const { accountId } = useParams<{ accountId: string }>()
  const [state, send] = useMachine(
    clipboard.machine({
      id: useId(),
      value: accountId,
    }),
  )

  const api = clipboard.connect(state, send, normalizeProps)

  if (!accountId) {
    return null
  }

  return (
    <section
      aria-label="Account Details"
      className="mx-auto p-4"
      {...api.rootProps}
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
            className={`p-2 rounded flex items-center justify-center space-x-2 ${api.isCopied ? "bg-green-200" : ""}`}
            aria-label="Copy to clipboard"
            {...api.triggerProps}
          >
            <div className="flex items-center space-x-2">
              {api.isCopied ? <ClipboardCheck /> : <ClipboardCopyIcon />}
            </div>
          </button>
        </div>
        <p className="text-xs mb-4 bg-gray-200 p-3 rounded text-center">
          {accountId}
        </p>
      </div>
    </section>
  )
}
