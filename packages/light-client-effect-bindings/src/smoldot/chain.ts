import * as smoldot from "smoldot"

import { Cause, Effect } from "effect"
import {
  AlreadyDestroyedError,
  CrashError,
  JsonRpcDisabledError,
  QueueFullError,
} from "./data"

/** @internal */
export const make = (chain: smoldot.Chain) => {
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

  return {
    sendJsonRpc,
    nextJsonRpcResponse,
    remove,
  }
}
