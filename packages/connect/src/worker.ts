// @ts-ignore TODO: fix types in smoldot/worker
import * as smoldot from "smoldot/worker"

self.onmessage = ({ data }) => {
  smoldot
    .run(data)
    .catch((error: any) => console.error("[smoldot-worker]", error))
    .finally(self.close)
}
