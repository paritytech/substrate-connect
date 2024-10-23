import type {
  LightClientProvider,
  RawChain,
} from "@substrate/light-client-extension-helpers/web-page"
import type {
  AddChainOptions,
  Chain,
  SmoldotExtensionAPI,
} from "@substrate/smoldot-discovery/types"
import { Effect, Runtime, Queue, Stream, pipe, Deferred } from "effect"
export type { LightClientProvider } from "@substrate/light-client-extension-helpers/web-page"
export type * from "@substrate/smoldot-discovery/types"

export const defaultWellKnownChainGenesisHashes: Record<string, string> = {
  polkadot:
    "0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3",
  ksmcc3: "0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe",
  westend2:
    "0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e",
  paseo: "0x77afd6190f1554ad45fd0d31aee62aacc33c6db0ea801129acb813f913e0764f",
  rococo_v2_2:
    "0x6408de7737c59c238890533af25896a2c20608d8b380bb01029acb392781063e",
}

export type MakeOptions = {
  wellKnownChainGenesisHashes?: Record<string, string>
}

export const make = (
  lightClientProvider: LightClientProvider,
  connectOptions?: MakeOptions,
): SmoldotExtensionAPI => {
  const wellKnownChainGenesisHashes =
    connectOptions?.wellKnownChainGenesisHashes ??
    defaultWellKnownChainGenesisHashes

  const getChain = async (
    isWellKnown: boolean,
    chainSpecOrWellKnownName: string,
    relayChainGenesisHash?: string,
  ) => {
    let chain: RawChain

    if (isWellKnown) {
      const foundChain = Object.values(lightClientProvider.getChains()).find(
        ({ genesisHash }) =>
          genesisHash === wellKnownChainGenesisHashes[chainSpecOrWellKnownName],
      )
      if (!foundChain) throw new Error("Unknown well-known chain")
      chain = foundChain
    } else {
      chain = await lightClientProvider.getChain(
        chainSpecOrWellKnownName,
        relayChainGenesisHash,
      )
    }

    return chain
  }

  const internalAddChain = async (
    isWellKnown: boolean,
    chainSpecOrWellKnownName: string,
    _?: AddChainOptions,
    relayChainGenesisHash?: string,
  ): Promise<Chain> => {
    let resolveChain: (queue: Chain) => void
    const chainPromise = new Promise<Chain>((resolve) => {
      resolveChain = resolve
    })

    Effect.gen(function* () {
      const exit = yield* Deferred.make()
      const runtime = yield* Effect.runtime()
      const queue = yield* Queue.unbounded<string>()
      const chain = yield* Effect.tryPromise(() =>
        getChain(isWellKnown, chainSpecOrWellKnownName, relayChainGenesisHash),
      )

      const jsonRpcCallback = (msg: string) =>
        Queue.offer(queue, msg).pipe(
          Effect.andThen(() => Effect.void),
          Runtime.runPromise(runtime),
        )
      const jsonRpcConnection = yield* Effect.sync(() =>
        chain.connect(jsonRpcCallback),
      )

      const nextJsonRpcResponse = () =>
        Queue.take(queue).pipe(Runtime.runPromise(runtime))

      const jsonRpcResponses: AsyncIterableIterator<string> = {
        async next() {
          const value = await nextJsonRpcResponse()
          return { value, done: false }
        },
        [Symbol.asyncIterator]() {
          return this
        },
      }

      yield* Effect.sync(() =>
        resolveChain({
          sendJsonRpc: (rpc) => jsonRpcConnection.send(rpc),
          remove: () => {
            Effect.all(
              [
                Effect.sync(() => jsonRpcConnection.disconnect()),
                Deferred.succeed(exit, void 0),
              ],
              { mode: "either" },
            ).pipe(Runtime.runPromise(runtime))
          },
          nextJsonRpcResponse,
          jsonRpcResponses,
          addChain: (chainSpec) =>
            internalAddChain(false, chainSpec, {}, chain.genesisHash),
        } satisfies Chain),
      )

      yield* Deferred.await(exit)
    }).pipe(Effect.forkDaemon, Effect.runPromise)

    return chainPromise
  }

  return {
    addChain: (chainSpec, options) =>
      internalAddChain(false, chainSpec, options),
    addWellKnownChain: (name, options) => internalAddChain(true, name, options),
  }
}
