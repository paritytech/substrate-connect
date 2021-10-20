import { ExtensionMessageRouter } from "./ExtensionMessageRouter"
import { ExtensionPageInjector } from "./ExtensionPageInjector"
import { debug } from "../utils/debug"

debug("EXTENSION CONTENT SCRIPT RUNNING")

new ExtensionPageInjector()
const router = new ExtensionMessageRouter()
router.listen()
