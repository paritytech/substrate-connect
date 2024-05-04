import * as smoldot from "smoldot"

import { Brand, Cause, Effect, Scope } from "effect"
import {
  AddChainError,
  AlreadyDestroyedError,
  CrashError,
  JsonRpcDisabledError,
  QueueFullError,
} from "./data"

export type AddChainOptions = Readonly<
  Omit<smoldot.AddChainOptions, "potentialRelayChains"> & {
    potentialRelayChains?: Chain[]
  }
>

export type Client = Brand.Brand<"Client"> &
  Readonly<{
    addChain(
      options: AddChainOptions,
    ): Effect.Effect<
      Chain,
      | AddChainError
      | AlreadyDestroyedError
      | CrashError
      | Cause.UnknownException,
      Scope.Scope
    >

    /** @internal */
    _terminate: Effect.Effect<
      void,
      Cause.UnknownException | AlreadyDestroyedError | CrashError,
      never
    >
  }>
export type ClientOptions = Readonly<Omit<smoldot.ClientOptions, "logCallback">>

/** @internal */
export type ChainRefId = Brand.Brand<"ChainRefId"> & number

export type Chain = Brand.Brand<"Chain"> &
  Readonly<{
    /** @internal */
    _refId: ChainRefId
    /** @internal */
    _chainSpec: string
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
    /** @internal */
    _remove: Effect.Effect<
      void,
      AlreadyDestroyedError | CrashError | Cause.UnknownException,
      never
    >
  }>
