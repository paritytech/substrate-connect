/**
 * @vitest-environment jsdom
 */
import { it, describe, expect } from "vitest"
import { randomBytes } from "crypto"
import {
  type ToApplication,
  type ToExtension,
} from "@substrate/connect-extension-protocol"
import { createScClient } from "./extension"
import { AlreadyDestroyedError, CrashError } from "./types"

// we have to fake this API on node
import { WellKnownChain } from "../WellKnownChain.js"

if (!globalThis.crypto) {
  ;(globalThis.crypto as any) = {
    getRandomValues: <T extends ArrayBufferView | null>(arr: T) => {
      if (!arr) return arr
      const tmp = new Uint8Array(arr.byteLength)
      const randomBytesBuffer = randomBytes(tmp.length)
      tmp.set(randomBytesBuffer)
      const test = new DataView(arr.buffer)
      for (let i = 0; i < tmp.length; i++) {
        test.setUint8(i, tmp[i]!)
      }
      return arr
    },
  }
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

const postToClient = (msg: ToApplication) => {
  window.postMessage(msg, "*")
}

describe("SmoldotConnect::Extension", () => {
  describe("addChain", () => {
    it("adding a chain resolves the Promise upon receiving the `chain-ready` message", async () => {
      const { addChain } = createScClient()
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
      const { addChain } = createScClient()
      const chainPromise = addChain("")
      const addChainMessage = await getClientMessage()

      postToClient({
        type: "error",
        origin: "substrate-connect-extension",
        chainId: addChainMessage.chainId,
        errorMessage: "test",
      })

      await expect(chainPromise).rejects.toThrow(
        "Error while creating the chain: test",
      )
    })

    it("propagates the correct potentialRelayChainIds", async () => {
      const { addChain } = createScClient()
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
      await chainPromise

      chainPromise = addChain("")
      const addChainMsg3 = await getClientMessage()
      postToClient({
        type: "chain-ready",
        origin: "substrate-connect-extension",
        chainId: addChainMsg3.chainId,
      })
      await chainPromise

      const removeP = getClientMessage()
      chain1.remove()
      await removeP

      // adding an active chain from an unrelated client in order to ensure
      // that it doesn't show up in the list of `potentialRelayChainIds`
      const { addChain: addChain2 } = createScClient()
      chainPromise = addChain2("")
      const addChainMsg4 = await getClientMessage()
      postToClient({
        type: "chain-ready",
        origin: "substrate-connect-extension",
        chainId: addChainMsg4.chainId,
      })
      await chainPromise

      addChain("")
      const addChainMsg5 = await getClientMessage()
      expect(addChainMsg5).toMatchObject({
        type: "add-chain",
        chainSpec: "",
        potentialRelayChainIds: [addChainMsg2.chainId, addChainMsg3.chainId],
      })
    })
  })

  describe("addWellKnownChain", () => {
    it("adding a chain resolves the Promise upon receiving the `chain-ready` message", async () => {
      const { addWellKnownChain } = createScClient()
      const chainPromise = addWellKnownChain(WellKnownChain.polkadot)
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
  })

  describe("chain.remove", () => {
    it("removes the chain", async () => {
      const { addChain } = createScClient()
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
      const { addChain } = createScClient()
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
      const { addChain } = createScClient()
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

      // Wait for message to be delivered.
      await new Promise<void>((res) => {
        setTimeout(res, 100)
      })

      expect(() => chain.sendJsonRpc("")).toThrow(
        new CrashError("Extension has killed the chain: Boom!"),
      )
      expect(() => chain.remove()).toThrow(
        new CrashError("Extension has killed the chain: Boom!"),
      )
    })
  })

  it("ignores other messages", async () => {
    const { addChain } = createScClient()
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
