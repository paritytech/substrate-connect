import * as environment from "../environment"
import { type AddChain } from "./addChain"
import { loadWellKnownChains } from "./loadWellKnownChains"

// TODO: use substrate-client when it supports custom RPC calls like chainHead_unstable_finalizedDatabase
export const updateDatabases = async (addChain: AddChain) => {
  const wellKnownChains = [...(await loadWellKnownChains()).entries()]
  await Promise.allSettled(
    wellKnownChains.map(async ([chainName, chainSpec]) => {
      try {
        const newDatabaseContent: string = await new Promise(
          async (resolve, reject) => {
            try {
              const sendJsonRpc = (message: {
                id: string
                method: string
                params: any[]
              }) => {
                try {
                  chain.sendJsonRpc(
                    JSON.stringify({
                      jsonrpc: "2.0",
                      ...message,
                    }),
                  )
                } catch (error) {
                  reject(error)
                  chain.remove()
                }
              }
              const chain = await addChain(
                chainSpec,
                (rawMessage) => {
                  const message = JSON.parse(rawMessage)
                  if (message?.params?.result?.event === "initialized") {
                    sendJsonRpc({
                      id: "1",
                      method: "chainHead_unstable_finalizedDatabase",
                      params: [
                        // TODO: calculate this better
                        chrome.storage.local.QUOTA_BYTES /
                          wellKnownChains.length,
                      ],
                    })
                  } else if (message?.id === "1") {
                    chain.remove()
                    resolve(message.result)
                  }
                },
                undefined,
                await environment.get({
                  type: "database",
                  chainName,
                }),
              )
              sendJsonRpc({
                id: "0",
                method: "chainHead_unstable_follow",
                params: [true],
              })
            } catch (error) {
              reject(error)
            }
          },
        )
        await environment.set(
          { type: "database", chainName },
          newDatabaseContent,
        )
        console.log(`Updated ${chainName} database`)
      } catch (error) {
        console.error(`error updating ${chainName} database`)
      }
    }),
  )

  console.log("Updated WellKnownChain databases")
}
