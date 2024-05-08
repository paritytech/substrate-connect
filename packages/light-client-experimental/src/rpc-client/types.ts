import { Effect, Scope } from "effect"
import { ChainHeadRPC } from "./chainhead"
import { ChainSpecRPC } from "./chainSpec"

export type ChainheadRPCSubscribe = Effect.Effect<
  ChainHeadRPC,
  never,
  Scope.Scope
>

export type RPCClient = {
  chainSpec: ChainSpecRPC
  chainhead: ChainheadRPCSubscribe
}

export type { ChainHeadRPC, ChainSpecRPC }
