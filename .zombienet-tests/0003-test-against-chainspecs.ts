import { connect } from "./utils"

export async function run(nodeName: string) {
  let name = nodeName != "rococo" ? nodeName : "rococo_v2_2"
  console.log("name", name)
  let networkInfo = {
    test: {
      userDefinedTypes: [],
    },
    chainSpecPath: `../packages/connect/src/connector/specs/${name}.json`,
  }

  const api = await connect("light-client", networkInfo)
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
