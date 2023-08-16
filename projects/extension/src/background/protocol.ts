import { ToExtension } from "@substrate/connect-extension-protocol"

/**
 * This module contains the types that are exchanged between the content script and the
 * extension's background page.
 *
 * All of the `ToBackground` messages *must* be answered in order to avoid some tricky race
 * conditions (note: in reality only some of them need to be answered, but it's been decided
 * that all of them should, for consistency). If not specified, they are answered with `null`.
 *
 * **IMPORTANT**: Each `ToBackground` message must only be sent after the previously sent message
 * has received a response. Again, this avoids tricky race conditions.
 */

export type ToBackground = ToBackgroundTabReset | ToExtension

// Report to the extension that all the chains of the current tab are not needed and can be removed.
// This is sent when the content script is loaded in order to indicate that the previous content
// script of the same tab no longer exists.
export interface ToBackgroundTabReset {
  type: "tab-reset"
}
