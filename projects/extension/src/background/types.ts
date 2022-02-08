import EventEmitter from "eventemitter3"
import StrictEventEmitter from "strict-event-emitter-types"
import { SmoldotHealth } from "@substrate/smoldot-light"

export interface ExposedChainConnection {
  chainId: string
  chainName: string
  tabId: number
  url: string
  healthStatus?: SmoldotHealth
}

export interface StateEvents {
  stateChanged: ExposedChainConnection[]
}

export type StateEmitter = StrictEventEmitter<EventEmitter, StateEvents>
