import { start } from "smoldot"
import { register } from "@polkadot-api/light-client-extension-helpers/background"

register(start({ maxLogLevel: 4 }))
