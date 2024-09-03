/// <reference lib="WebWorker" />

import * as smoldot from "smoldot/worker"
import { compileBytecode } from "smoldot/bytecode"

declare var self: DedicatedWorkerGlobalScope

compileBytecode().then((bytecode: unknown) => self.postMessage(bytecode))

self.onmessage = ({ data }) =>
  smoldot
    .run(data)
    .catch((error: any) => console.error("[smoldot-worker]", error))
    .finally(self.close)
