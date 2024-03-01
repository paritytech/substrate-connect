import { createRpc } from "@substrate/light-client-extension-helpers/utils"
import { useEffect, useState } from "react"
import { UserSignedExtensions } from "@polkadot-api/tx-helper"
import type { BackgroundRpcSpec, SignRequest } from "../background/types"
import { DecodedCallData } from "./WalletPopup/components"
import { UserSignedExtensionInputs } from "./WalletPopup/components/UserSignedExtensionInputs"

// FIXME: use hook
const port = chrome.runtime.connect({
  name: "substrate-wallet-template/wallet-popup",
})
const rpc = createRpc((msg) =>
  port.postMessage(msg),
).withClient<BackgroundRpcSpec>()
port.onMessage.addListener(rpc.handle)

export const WalletPopup = () => {
  const [signRequest, setSignRequest] = useState<SignRequest>()
  const [signRequestId, setSignRequestId] = useState<string>()
  const [userSignedExtensions, setUserSignedExtensions] = useState<
    Partial<UserSignedExtensions>
  >({})
  useEffect(() => {
    const init = async () => {
      const signRequests = await rpc.client.getSignRequests()
      // TODO: handle many signRequests
      const keys = Object.keys(signRequests)
      if (keys.length === 0) return
      setSignRequestId(keys[0])
      setSignRequest(signRequests[keys[0]])
    }
    init()
  }, [])
  if (!signRequestId || !signRequest) return null
  return (
    <main className="w-[32rem] mx-auto px-6 py-8">
      <div>
        <h1 className="text-3xl font-bold">Sign Request #{signRequestId}</h1>
        <div className="my-4">
          <div className="my-2">
            <div className="text-xs font-semibold">Origin</div>
            <div className="text-sm">{signRequest.url}</div>
          </div>
          <div className="my-2 overflow-hidden">
            <div className="text-xs font-semibold">Chain Id</div>
            <pre className="text-sm overflow-auto">{signRequest.chainId}</pre>
          </div>
          <div className="my-2">
            <div className="text-xs font-semibold">From</div>
            <pre className="text-sm">{signRequest.address}</pre>
          </div>
          <div className="my-2 overflow-hidden">
            <div className="text-xs font-semibold">Call data</div>
            <pre className="text-sm overflow-auto">{signRequest.callData}</pre>
          </div>
          <div className="my-2">
            <div className="text-xs font-semibold">Decoded Call data</div>
            <DecodedCallData
              chainId={signRequest.chainId}
              callData={signRequest.callData}
            />
          </div>
          <div className="my-2">
            <div className="text-xs font-semibold">Signed extensions</div>
            <UserSignedExtensionInputs
              userSignedExtensionNames={signRequest.userSignedExtensionNames}
              onChange={setUserSignedExtensions}
            />
          </div>
        </div>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() =>
              rpc.client.approveSignRequest(signRequestId, userSignedExtensions)
            }
            className="py-1.5 px-8 mr-4 text-sm rounded border border-[#24cc85] text-[#24cc85] hover:text-white
                  hover:bg-[#24cc85]"
          >
            Approve
          </button>
          <button
            onClick={() => rpc.client.cancelSignRequest(signRequestId)}
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
