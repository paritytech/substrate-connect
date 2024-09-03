import * as smoldot from "smoldot/worker"
import { compileBytecode } from "smoldot/bytecode"
import { parentPort } from "node:worker_threads"

compileBytecode().then((bytecode: any) => parentPort!.postMessage(bytecode))

parentPort!.once("message", (data) =>
  smoldot
    .run(data)
    .catch((error: any) => console.error("[smoldot-worker]", error))
    .finally(() => process.exit()),
)
