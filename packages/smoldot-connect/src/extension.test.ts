import { randomBytes } from "crypto"
import {
  ToApplication,
  ToExtension,
} from "@substrate/connect-extension-protocol"
import { addChain } from "./extension"

// we have to fake this API on node
import { AlreadyDestroyedError, JsonRpcDisabledError } from "./errors"
import { JsonRpcCallback } from "./types"
;(globalThis.crypto as any) = {
  getRandomValues: <T extends ArrayBufferView | null>(arr: T) => {
    if (!arr) return arr
    const tmp = new Uint8Array(arr.byteLength)
    const randomBytesBuffer = randomBytes(tmp.length)
    tmp.set(randomBytesBuffer)
    const test = new DataView(arr.buffer)
    for (let i = 0; i < tmp.length; i++) {
      test.setUint8(i, tmp[i])
    }
    return arr
  },
}

const getClientMessage = (timeout = 10) =>
  new Promise<ToExtension>((res, rej) => {
    const token = setTimeout(rej, timeout)
    const onMessage = ({ data }: MessageEvent<ToExtension>) => {
      if (data?.origin !== "substrate-connect-client") return
      window.removeEventListener("message", onMessage)
      clearTimeout(token)
      res(data)
    }
    window.addEventListener("message", onMessage)
  })

const getExtensionMessage = (timeout = 10) =>
  new Promise<ToApplication>((res, rej) => {
    const token = setTimeout(rej, timeout)
    const onMessage = ({ data }: MessageEvent<ToApplication>) => {
      if (data?.origin !== "substrate-connect-extension") return
      window.removeEventListener("message", onMessage)
      clearTimeout(token)
      res(data)
    }
    window.addEventListener("message", onMessage)
  })

const postToClient = (msg: ToApplication) => {
  window.postMessage(msg, "*")
}

describe("SmoldotConnect::Extension", () => {
  describe("addChain", () => {
    it("adding a chain resolves the Promise upon receiving the `chain-ready` message", async () => {
      const clientMessageP = getClientMessage()
      const chainPromise = addChain("")
      const clientMessage = await clientMessageP
      postToClient({
        type: "chain-ready",
        origin: "substrate-connect-extension",
        chainId: clientMessage.chainId,
      })
      const chain = await chainPromise
      expect(typeof chain.remove).toBe("function")
      expect(typeof chain.sendJsonRpc).toBe("function")
    })

    it("adding a chain rejects the Promise upon receiving an error while waiting for `chain-ready`", async () => {
      const clientMessageP = getClientMessage()
      const chainPromise = addChain("")
      const clientMessage = await clientMessageP
      postToClient({
        type: "error",
        origin: "substrate-connect-extension",
        chainId: clientMessage.chainId,
        errorMessage: "",
      })
      await expect(chainPromise).rejects.toThrow(
        "There was an error creating the smoldot chain.",
      )
    })

    it("propagates the correct potentialRelayChainIds", async () => {
      let clientMessageP = getClientMessage()
      let chainPromise = addChain("")
      const addChainMsg1 = await clientMessageP
      postToClient({
        type: "chain-ready",
        origin: "substrate-connect-extension",
        chainId: addChainMsg1.chainId,
      })
      const chain1 = await chainPromise

      clientMessageP = getClientMessage()
      chainPromise = addChain("")
      const addChainMsg2 = await clientMessageP
      postToClient({
        type: "chain-ready",
        origin: "substrate-connect-extension",
        chainId: addChainMsg2.chainId,
      })
      const chain2 = await chainPromise

      clientMessageP = getClientMessage()
      chainPromise = addChain("")
      const addChainMsg3 = await clientMessageP
      postToClient({
        type: "chain-ready",
        origin: "substrate-connect-extension",
        chainId: addChainMsg3.chainId,
      })
      const chain3 = await chainPromise

      const removeP = getClientMessage()
      chain1.remove()
      await removeP

      clientMessageP = getClientMessage()
      addChain("", () => {}, [chain1, chain2, chain3])
      const addChainMsg4 = await clientMessageP
      expect(addChainMsg4).toMatchObject({
        type: "add-chain",
        chainSpec: "",
        potentialRelayChainIds: [addChainMsg2.chainId, addChainMsg3.chainId],
      })
    })
  })

  describe("chain.sendJsonRpc", () => {
    it("throws when calling sendJsonRpc if no jsonRpcCallback was provided", async () => {
      let clientMessageP = getClientMessage()
      const chainPromise = addChain("")
      const addChainMsg = await clientMessageP
      postToClient({
        type: "chain-ready",
        origin: "substrate-connect-extension",
        chainId: addChainMsg.chainId,
      })
      const chain = await chainPromise

      expect(() => chain.sendJsonRpc("")).toThrow(JsonRpcDisabledError)
    })

    it("sends and receives jsonRpc messages", async () => {
      const receivedMessages: string[] = []
      const jsonRpcCallback: JsonRpcCallback = (response) => {
        receivedMessages.push(response)
      }

      let clientMessageP = getClientMessage()
      const chainPromise = addChain("", jsonRpcCallback)
      const addChainMsg = await clientMessageP
      postToClient({
        type: "chain-ready",
        origin: "substrate-connect-extension",
        chainId: addChainMsg.chainId,
      })

      const chain = await chainPromise
      expect(receivedMessages.length).toBe(0)

      clientMessageP = getClientMessage()
      chain.sendJsonRpc("ping")
      const receivedRequest = await clientMessageP

      expect(receivedRequest).toMatchObject({
        chainId: addChainMsg.chainId,
        type: "rpc",
        jsonRpcMessage: "ping",
      })
      expect(receivedMessages.length).toBe(0)

      postToClient({
        chainId: addChainMsg.chainId,
        origin: "substrate-connect-extension",
        type: "rpc",
        jsonRpcMessage: "pong",
      })
      await getExtensionMessage()

      expect(receivedMessages).toEqual(["pong"])
    })
  })

  describe("chain.remove", () => {
    it("correctly removes the chain", async () => {
      let clientMessageP = getClientMessage()
      const chainPromise = addChain("")
      const addChainMsg = await clientMessageP
      postToClient({
        type: "chain-ready",
        origin: "substrate-connect-extension",
        chainId: addChainMsg.chainId,
      })
      const chain = await chainPromise

      clientMessageP = getClientMessage()
      chain.remove()
      const removeChainMsg = await clientMessageP
      expect(removeChainMsg).toEqual({
        origin: addChainMsg.origin,
        chainId: addChainMsg.chainId,
        type: "remove-chain",
      })
    })

    it("throws if the chain has already been removed", async () => {
      let clientMessageP = getClientMessage()
      const chainPromise = addChain("")
      const addChainMsg = await clientMessageP
      postToClient({
        type: "chain-ready",
        origin: "substrate-connect-extension",
        chainId: addChainMsg.chainId,
      })
      const chain = await chainPromise

      clientMessageP = getClientMessage()
      chain.remove()
      await clientMessageP
      expect(() => chain.remove()).toThrow(AlreadyDestroyedError)
    })
  })
})
