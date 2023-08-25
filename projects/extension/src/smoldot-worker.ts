import * as smoldot from "smoldot/worker"

/* eslint-disable-next-line no-restricted-globals */
self.onmessage = ({ data }) => {
  smoldot
    .run(data)
    .catch((error: any) => console.error("[smoldot-worker]", error))
    /* eslint-disable-next-line no-restricted-globals */
    .finally(self.close)
}
