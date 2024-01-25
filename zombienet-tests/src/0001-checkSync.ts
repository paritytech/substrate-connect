import { connect } from "./utils"

export async function run(nodeName: string, networkInfo: any) {
  const client = await connect(nodeName, networkInfo)
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
