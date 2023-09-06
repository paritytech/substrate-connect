// @ts-ignore TODO: fix types in smoldot/worker
import * as smoldot from "smoldot/worker"
import { parentPort } from "node:worker_threads"

parentPort!.once("message", (data) =>
  smoldot
    .run(data)
    .catch((error: any) => console.error("[smoldot-worker]", error))
    .finally(() => process.exit()),
)
