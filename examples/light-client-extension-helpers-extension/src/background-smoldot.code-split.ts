// This entry forces tsup (or esbuild) to code split "smoldot"
//
// Simarly, with Rollup, code splitting could be configured using output.manualChunks
//
//   export default {
//     input: "src/background.ts",
//     output: {
//       format: "esm",
//       dir: "dist/js/background",
//       manualChunks: {
//         smoldot: ["smoldot"],
//       },
//     },
//     plugins: [pluginNodeResolve(), pluginEsbuild()],
//   }

import { start } from "smoldot"

const clientReferencesMaxLogLevel = 3

export const smoldotClient = start({
  forbidTcp: true, // In order to avoid confusing inconsistencies between browsers and NodeJS, TCP connections are always disabled.
  forbidNonLocalWs: true, // Prevents browsers from emitting warnings if smoldot tried to establish non-secure WebSocket connections
  maxLogLevel: 9999999, // The actual level filtering is done in the logCallback
  cpuRateLimit: 0.5, // Politely limit the CPU usage of the smoldot background worker.
  logCallback: (level, target, message) => {
    if (level > clientReferencesMaxLogLevel) return

    // The first parameter of the methods of `console` has some printf-like substitution
    // capabilities. We don't really need to use this, but not using it means that the logs
    // might not get printed correctly if they contain `%`.
    if (level <= 1) {
      console.error("[%s] %s", target, message)
    } else if (level === 2) {
      console.warn("[%s] %s", target, message)
    } else if (level === 3) {
      console.info("[%s] %s", target, message)
    } else if (level === 4) {
      console.debug("[%s] %s", target, message)
    } else {
      console.trace("[%s] %s", target, message)
    }
  },
})
