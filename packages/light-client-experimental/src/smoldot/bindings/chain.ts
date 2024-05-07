import * as smoldot from "smoldot"

import { Cause, Effect, Brand } from "effect"
import {
  AlreadyDestroyedError,
  CrashError,
  JsonRpcDisabledError,
  QueueFullError,
} from "../data"

export type Chain = Readonly<{
  /** @internal */
  _original: smoldot.Chain
  sendJsonRpc(
    rpc: string,
  ): Effect.Effect<
    void,
    | QueueFullError
    | AlreadyDestroyedError
    | JsonRpcDisabledError
    | CrashError
    | Cause.UnknownException,
    never
  >
  nextJsonRpcResponse: Effect.Effect<
    string,
    | AlreadyDestroyedError
    | JsonRpcDisabledError
    | CrashError
    | Cause.UnknownException,
    never
  >
  remove: Effect.Effect<
    void,
    AlreadyDestroyedError | CrashError | Cause.UnknownException,
    never
  >
}> &
  Brand.Brand<"Chain">

export const make = (chain: smoldot.Chain): Chain => {
  const Chain = Brand.nominal<Chain>()
  const sendJsonRpc = (rpc: string) =>
    Effect.try({
      try: () => chain.sendJsonRpc(rpc),
      catch: (err) => {
        if (err instanceof smoldot.QueueFullError) {
          return new QueueFullError()
        }
        if (err instanceof smoldot.AlreadyDestroyedError) {
          return new AlreadyDestroyedError()
        }
        if (err instanceof smoldot.JsonRpcDisabledError) {
          return new JsonRpcDisabledError()
        }
        if (err instanceof smoldot.CrashError) {
          return new CrashError()
        }

        return new Cause.UnknownException(err)
      },
    })

  const nextJsonRpcResponse = Effect.tryPromise({
    try: () => chain.nextJsonRpcResponse(),
    catch: (err) => {
      if (err instanceof smoldot.AlreadyDestroyedError) {
        return new AlreadyDestroyedError()
      }
      if (err instanceof smoldot.JsonRpcDisabledError) {
        return new JsonRpcDisabledError()
      }
      if (err instanceof smoldot.CrashError) {
        return new CrashError()
      }

      return new Cause.UnknownException(err)
    },
  })

  const remove = Effect.try({
    try: () => chain.remove(),
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

  return Chain({
    _original: chain,
    sendJsonRpc,
    nextJsonRpcResponse,
    remove,
  })
}

export const unwrap = (chain: Chain): smoldot.Chain => chain._original
