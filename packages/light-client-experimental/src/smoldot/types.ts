import * as smoldot from "smoldot"

export type ClientOptions = Readonly<smoldot.ClientOptions>

type AddRelayChainOptions = Omit<
  smoldot.AddChainOptions,
  "potentialRelayChains"
>

export type AddChainOptions = Readonly<
  AddRelayChainOptions & {
    potentialRelayChains?: Readonly<AddRelayChainOptions>[]
  }
>

export type Client = {
  addChain: (options: AddChainOptions) => Promise<Chain>
  terminate: () => Promise<void>
  restart: () => Promise<void>
}

export type Chain = smoldot.Chain

export {
  AddChainError,
  AlreadyDestroyedError,
  JsonRpcDisabledError,
  CrashError,
  QueueFullError,
} from "smoldot"
