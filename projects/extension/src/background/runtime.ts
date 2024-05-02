import { ManagedRuntime } from "effect"
import { DevTools } from "@effect/experimental"

export const ExtensionRuntime = ManagedRuntime.make(DevTools.layer())
