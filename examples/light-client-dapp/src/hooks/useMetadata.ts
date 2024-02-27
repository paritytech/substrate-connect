import { useEffect, useState } from "react"
import { ConnectProvider, getScProvider } from "@polkadot-api/sc-provider"
import { createClient } from "@polkadot-api/substrate-client"
import {
  compact,
  metadata,
  CodecType,
  Tuple,
  Option,
  u32,
} from "@polkadot-api/substrate-bindings"
import { toHex } from "@polkadot-api/utils"
import { useIsMounted } from "./useIsMounted"

type Metadata = CodecType<typeof metadata>

const opaqueMeta = Option(Tuple(compact, metadata))

const withLogsProvider = (input: ConnectProvider): ConnectProvider => {
  return (onMsg) => {
    const result = input((msg) => {
      console.log("<< " + msg)
      onMsg(msg)
    })

    return {
      ...result,
      send: (msg) => {
        console.log(">> " + msg)
        result.send(msg)
      },
    }
  }
}

export const useMetadata = (chain: string) => {
  const isMounted = useIsMounted()
  const [metadata, setMetadata] = useState<Metadata>()

  useEffect(() => {
    if (!isMounted()) return

    const scProvider = getScProvider()
    const smProvider = scProvider(chain).relayChain
    const { chainHead } = createClient(withLogsProvider(smProvider))

    const getMetadata = (): Promise<Metadata> =>
      new Promise<Metadata>((res, rej) => {
        let requested = false
        const chainHeadFollower = chainHead(
          true,
          (message) => {
            if (message.type === "newBlock") {
              chainHeadFollower.unpin([message.blockHash])
              return
            }
            if (requested || message.type !== "finalized") return
            const latestFinalized = message.finalizedBlockHashes[0]
            console.log("latestFinalized", latestFinalized)

            if (requested) return
            requested = true

            chainHeadFollower
              .call(
                latestFinalized,
                "Metadata_metadata_at_version",
                toHex(u32.enc(15)),
              )
              .then((response) => {
                const [, metadata] = opaqueMeta.dec(response)!
                res(metadata)
              })
              .catch((e) => {
                console.log("error", e)
                rej(e)
              })
              .finally(() => {
                chainHeadFollower.unfollow()
              })
          },
          () => {},
        )
      })

    getMetadata().then((metadata) => setMetadata(metadata))
  }, [isMounted, chain])

  return metadata
}
