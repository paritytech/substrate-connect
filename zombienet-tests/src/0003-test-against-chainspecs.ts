import { connect } from "./utils"

export async function run(nodeName: string) {
  let name = nodeName != "rococo" ? nodeName : "rococo_v2_2"
  console.log("name", name)
  let networkInfo = {
    test: {
      userDefinedTypes: [],
    },
    chainSpecPath: `../../packages/connect-known-chains/specs/${name}.json`,
  }

  const client = await connect("light-client", networkInfo)
  let count = 0
  await new Promise<void>(async (resolve, reject) => {
    const chainHeadFollower = client.chainHead(
      true,
      (event) => {
        if (event.type === "finalized" && ++count === 2) {
          chainHeadFollower.unfollow()
          resolve()
        }
      },
      reject,
    )
  })
  client.destroy()
  return count
}
