import * as smoldot from "smoldot"

import { Cause, Effect, pipe as $ } from "effect"
import { AddChainError, AlreadyDestroyedError, CrashError } from "../data"
import { Chain, make as makeChain } from "./chain"

export type Client = Readonly<{
  addChain(
    options: smoldot.AddChainOptions,
  ): Effect.Effect<
    Chain,
    AddChainError | AlreadyDestroyedError | CrashError | Cause.UnknownException,
    never
  >
  terminate: Effect.Effect<
    void,
    AlreadyDestroyedError | CrashError | Cause.UnknownException,
    never
  >
}>

export const make = (client: smoldot.Client): Client => {
  const addChain = (options: smoldot.AddChainOptions) =>
    $(
      Effect.tryPromise({
        try: () => client.addChain(options),
        catch: (err) => {
          if (err instanceof smoldot.AddChainError) {
            return new AddChainError()
          }
          if (err instanceof smoldot.AlreadyDestroyedError) {
            return new AlreadyDestroyedError()
          }
          if (err instanceof smoldot.CrashError) {
            return new CrashError()
          }

          return new Cause.UnknownException(err)
        },
      }),
      Effect.map(makeChain),
    )

  const terminate = Effect.tryPromise({
    try: () => client.terminate(),
    catch: (err) => {
      if (err instanceof smoldot.AlreadyDestroyedError) {
        return new AlreadyDestroyedError()
      }
      if (err instanceof smoldot.CrashError) {
        return new CrashError()
      }

      return new Cause.UnknownException(err)
    },
  })

  return { addChain, terminate }
}
