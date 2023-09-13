import { connect } from "./utils"

export async function run(nodeName: string, networkInfo: any) {
  const api = await connect(nodeName, networkInfo, "100")
  let count = 0
  await new Promise(async (resolve) => {
    const unsub = await api.rpc.chain.subscribeNewHeads(() => {
      if (++count === 2) {
        resolve(unsub())
      }
    })
  })
  return count
}
