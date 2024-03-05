import { useEffect, useState } from "react"
import { UserSignedExtensions } from "@polkadot-api/tx-helper"
import type { SignRequest } from "../background/types"
import {
  DecodedCallData,
  UserSignedExtensionInputs,
} from "./WalletPopup/components"
import { rpc } from "./WalletPopup/api"

export const WalletPopup = () => {
  const [signRequest, setSignRequest] = useState<{
    id: string
    request: SignRequest
  }>()
  const [userSignedExtensions, setUserSignedExtensions] = useState<
    Partial<UserSignedExtensions>
  >({})
  useEffect(() => {
    const init = async () => {
      const signRequests = await rpc.client.getSignRequests()
      // TODO: handle many signRequests in a single window
      const id = getSignRequestId()
      if (!id || !signRequests[id]) return window.close()
      setSignRequest({ id, request: signRequests[id] })
    }
    init()
  }, [])
  if (!signRequest) return null
  const { request } = signRequest
  return (
    <main className="w-[32rem] mx-auto px-6 py-8">
      <div>
        <h1 className="text-3xl font-bold">Sign Request #{signRequest.id}</h1>
        <div className="my-4">
          <div className="my-2">
            <div className="text-xs font-semibold">Origin</div>
            <div className="text-sm">{request.url}</div>
          </div>
          <div className="my-2 overflow-hidden">
            <div className="text-xs font-semibold">Chain Id</div>
            <pre className="text-sm overflow-auto">{request.chainId}</pre>
          </div>
          <div className="my-2">
            <div className="text-xs font-semibold">From</div>
            <pre className="text-sm">{request.address}</pre>
          </div>
          <div className="my-2 overflow-hidden">
            <div className="text-xs font-semibold">Call data</div>
            <pre className="text-sm overflow-auto">{request.callData}</pre>
          </div>
          <div className="my-2">
            <div className="text-xs font-semibold">Decoded Call data</div>
            <DecodedCallData
              chainId={request.chainId}
              callData={request.callData}
            />
          </div>
          <div className="my-2">
            <div className="text-xs font-semibold">Signed extensions</div>
            <UserSignedExtensionInputs
              userSignedExtensionNames={request.userSignedExtensionNames}
              onChange={setUserSignedExtensions}
            />
          </div>
        </div>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() =>
              rpc.client.approveSignRequest(
                signRequest.id,
                userSignedExtensions,
              )
            }
            className="py-1.5 px-8 mr-4 text-sm rounded border border-[#24cc85] text-[#24cc85] hover:text-white
                  hover:bg-[#24cc85]"
          >
            Approve
          </button>
          <button
            onClick={() => rpc.client.cancelSignRequest(signRequest.id)}
            className="py-1.5 px-8 text-sm rounded border border-[#24cc85] text-[#24cc85] hover:text-white
                  hover:bg-[#24cc85]"
          >
            Cancel
          </button>
        </div>
      </div>
    </main>
  )
}

const getSignRequestId = () => {
  const match = window.location.hash.match(/^#\/sign-request\/(\d+)$/)
  if (!match) return null
  return match[1]
}
