import * as Smoldot from "smoldot"

import { Brand, Cause, Effect, Scope } from "effect"
import {
  AddChainError,
  AlreadyDestroyedError,
  CrashError,
  JsonRpcDisabledError,
  QueueFullError,
} from "./data"

export type AddChainOptions = Readonly<
  Omit<Smoldot.AddChainOptions, "potentialRelayChains">
> & { potentialRelayChains?: never }

export type Client = Readonly<{
  addChain(
    options: AddChainOptions,
  ): Effect.Effect<
    Chain,
    AddChainError | AlreadyDestroyedError | CrashError | Cause.UnknownException,
    never
  >
  restart: Effect.Effect<Client, never, Scope.Scope>
}> &
  Brand.Brand<"Client">
export type ClientOptions = Readonly<Omit<Smoldot.ClientOptions, "logCallback">>

/** @internal */
export type ChainRefId = number & Brand.Brand<"ChainRefId">

export type Chain = Readonly<{
  /** @internal */
  _refId: ChainRefId
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
  remove: Effect.Effect<void, never, never>
}> &
  Brand.Brand<"Chain">
