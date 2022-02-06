import { randomBytes } from "crypto"
import {
  ToApplication,
  ToExtension,
} from "@substrate/connect-extension-protocol"
import { addChain, addWellKnownChain } from "./extension"
import {
  AlreadyDestroyedError,
  CrashError,
  JsonRpcDisabledError,
} from "./errors"
import { JsonRpcCallback } from "./types"

// we have to fake this API on node
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
      const chainPromise = addChain("")
      const addChainMessage = await getClientMessage()
      expect(addChainMessage).toMatchObject({
        origin: "substrate-connect-client",
        type: "add-chain",
        chainSpec: "",
        potentialRelayChainIds: [],
      })

      postToClient({
        type: "chain-ready",
        origin: "substrate-connect-extension",
        chainId: addChainMessage.chainId,
      })

      const chain = await chainPromise

      expect(typeof chain.remove).toBe("function")
      expect(typeof chain.sendJsonRpc).toBe("function")
    })

    it("adding a chain rejects the Promise upon receiving an error while waiting for `chain-ready`", async () => {
      const chainPromise = addChain("")
      const addChainMessage = await getClientMessage()

      postToClient({
        type: "error",
        origin: "substrate-connect-extension",
        chainId: addChainMessage.chainId,
        errorMessage: "",
      })

      await expect(chainPromise).rejects.toThrow(
        "There was an error creating the smoldot chain.",
      )
    })

    it("propagates the correct potentialRelayChainIds", async () => {
      let chainPromise = addChain("")
      const addChainMsg1 = await getClientMessage()
      postToClient({
        type: "chain-ready",
        origin: "substrate-connect-extension",
        chainId: addChainMsg1.chainId,
      })
      const chain1 = await chainPromise

      chainPromise = addChain("")
      const addChainMsg2 = await getClientMessage()
      postToClient({
        type: "chain-ready",
        origin: "substrate-connect-extension",
        chainId: addChainMsg2.chainId,
      })
      const chain2 = await chainPromise

      chainPromise = addChain("")
      const addChainMsg3 = await getClientMessage()
      postToClient({
        type: "chain-ready",
        origin: "substrate-connect-extension",
        chainId: addChainMsg3.chainId,
      })
      const chain3 = await chainPromise

      const removeP = getClientMessage()
      chain1.remove()
      await removeP

      addChain("", () => {}, [chain1, chain2, chain3])
      const addChainMsg4 = await getClientMessage()
      expect(addChainMsg4).toMatchObject({
        type: "add-chain",
        chainSpec: "",
        potentialRelayChainIds: [addChainMsg2.chainId, addChainMsg3.chainId],
      })
    })
  })

  describe("addWellKnownChain", () => {
    it("adding a chain resolves the Promise upon receiving the `chain-ready` message", async () => {
      const chainPromise = addWellKnownChain("polkadot")
      const addChainMessage = await getClientMessage()
      expect(addChainMessage).toMatchObject({
        origin: "substrate-connect-client",
        type: "add-well-known-chain",
        chainName: "polkadot",
      })

      postToClient({
        type: "chain-ready",
        origin: "substrate-connect-extension",
        chainId: addChainMessage.chainId,
      })

      const chain = await chainPromise

      expect(typeof chain.remove).toBe("function")
      expect(typeof chain.sendJsonRpc).toBe("function")
    })

    it("adding a chain rejects the Promise upon receiving an error while waiting for `chain-ready`", async () => {
      const chainPromise = addWellKnownChain("polkadot")
      const addChainMessage = await getClientMessage()

      postToClient({
        type: "error",
        origin: "substrate-connect-extension",
        chainId: addChainMessage.chainId,
        errorMessage: "",
      })

      await expect(chainPromise).rejects.toThrow(
        "There was an error creating the smoldot chain.",
      )
    })
  })

  describe("chain.sendJsonRpc", () => {
    it("sends and receives jsonRpc messages", async () => {
      const receivedMessages: string[] = []
      const jsonRpcCallback: JsonRpcCallback = (response) => {
        receivedMessages.push(response)
      }

      const chainPromise = addChain("", jsonRpcCallback)
      const addChainMsg = await getClientMessage()
      postToClient({
        type: "chain-ready",
        origin: "substrate-connect-extension",
        chainId: addChainMsg.chainId,
      })

      const chain = await chainPromise
      expect(receivedMessages.length).toBe(0)

      chain.sendJsonRpc("ping")
      const receivedRequest = await getClientMessage()

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
  })

  describe("chain.remove", () => {
    it("removes the chain", async () => {
      const chainPromise = addChain("")
      const addChainMsg = await getClientMessage()
      postToClient({
        type: "chain-ready",
        origin: "substrate-connect-extension",
        chainId: addChainMsg.chainId,
      })
      const chain = await chainPromise

      chain.remove()
      const removeChainMsg = await getClientMessage()
      expect(removeChainMsg).toEqual({
        origin: addChainMsg.origin,
        chainId: addChainMsg.chainId,
        type: "remove-chain",
      })
    })

    it("throws if the chain has already been removed", async () => {
      const chainPromise = addChain("", () => {})
      const addChainMsg = await getClientMessage()
      postToClient({
        type: "chain-ready",
        origin: "substrate-connect-extension",
        chainId: addChainMsg.chainId,
      })
      const chain = await chainPromise

      chain.remove()
      await getClientMessage()
      expect(() => chain.remove()).toThrow(AlreadyDestroyedError)
      expect(() => chain.sendJsonRpc("")).toThrow(AlreadyDestroyedError)
    })
  })

  describe("CrashError", () => {
    it("correctly handles CrashErrors received from the Extension", async () => {
      const chainPromise = addChain("", () => {})
      const addChainMsg = await getClientMessage()
      postToClient({
        type: "chain-ready",
        origin: "substrate-connect-extension",
        chainId: addChainMsg.chainId,
      })

      const chain = await chainPromise

      postToClient({
        type: "error",
        origin: "substrate-connect-extension",
        chainId: addChainMsg.chainId,
        errorMessage: "Boom!",
      })

      const clientMsg = await getClientMessage()

      const expectedMsg: ToExtension = {
        origin: "substrate-connect-client",
        chainId: addChainMsg.chainId,
        type: "remove-chain",
      }
      expect(clientMsg).toEqual(expectedMsg)

      expect(() => chain.sendJsonRpc("")).toThrow(new CrashError("Boom!"))
      expect(() => chain.remove()).toThrow(new CrashError("Boom!"))
    })

    it("procudes a CrashError when receiving an unexpected message", async () => {
      const chainPromise = addChain("", () => {})
      const addChainMsg = await getClientMessage()
      postToClient({
        type: "chain-ready",
        origin: "substrate-connect-extension",
        chainId: addChainMsg.chainId,
      })

      const chain = await chainPromise

      postToClient({
        type: "chain-ready",
        origin: "substrate-connect-extension",
        chainId: addChainMsg.chainId,
      })

      const clientMsg = await getClientMessage()

      const expectedMsg: ToExtension = {
        origin: "substrate-connect-client",
        chainId: addChainMsg.chainId,
        type: "remove-chain",
      }
      expect(clientMsg).toEqual(expectedMsg)

      expect(() => chain.sendJsonRpc("")).toThrow(
        new CrashError("Unexpected message received from the Extension"),
      )
      expect(() => chain.remove()).toThrow(
        new CrashError("Unexpected message received from the Extension"),
      )
    })

    it("procudes a CrashError when receiving an rpc message when no jsonRpcCallback was provided", async () => {
      const chainPromise = addChain("")
      const addChainMsg = await getClientMessage()
      postToClient({
        type: "chain-ready",
        origin: "substrate-connect-extension",
        chainId: addChainMsg.chainId,
      })

      const chain = await chainPromise

      postToClient({
        type: "rpc",
        origin: "substrate-connect-extension",
        chainId: addChainMsg.chainId,
        jsonRpcMessage: "",
      })

      const clientMsg = await getClientMessage()

      const expectedMsg: ToExtension = {
        origin: "substrate-connect-client",
        chainId: addChainMsg.chainId,
        type: "remove-chain",
      }
      expect(clientMsg).toEqual(expectedMsg)

      expect(() => chain.sendJsonRpc("")).toThrow(
        new CrashError("Unexpected message received from the Extension"),
      )
      expect(() => chain.remove()).toThrow(
        new CrashError("Unexpected message received from the Extension"),
      )
    })
  })

  it("ignores other messages", async () => {
    const chainPromise = addChain("", () => {})
    const addChainMsg = await getClientMessage()

    window.postMessage(undefined, "*")
    window.postMessage(
      {
        type: "error",
        origin: "wrong-substrate-connect-extension",
        chainId: addChainMsg.chainId,
        errorMessage: "boom!",
      },
      "*",
    )

    postToClient({
      type: "error",
      origin: "substrate-connect-extension",
      chainId: "wrong" + addChainMsg.chainId,
      errorMessage: "boom!",
    })

    postToClient({
      type: "chain-ready",
      origin: "substrate-connect-extension",
      chainId: addChainMsg.chainId,
    })
    const chain = await chainPromise

    expect(typeof chain.remove).toBe("function")
    expect(typeof chain.sendJsonRpc).toBe("function")
  })
})
