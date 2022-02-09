import { ConnectionManager } from "./background/ConnectionManager"
import { ExtensionMessageRouter } from "./content/ExtensionMessageRouter"

// This file is a fake entrypoint that exports the documented parts of the code
// so that typedoc can discover them to generate the documentation.  Don't
// remove it or we'll documentation generation will fail.

export { ConnectionManager, ExtensionMessageRouter }
