import type { JsonRpcProvider } from "@polkadot-api/json-rpc-provider"
import type { Client, AddChainOptions } from "../smoldot"
import { make as makeJSONRpcProvider } from "./json-rpc-provider"
import { Effect } from "effect"

type SmoldotProviderOptions =
  | { smoldotClient: Client; addChainOptions: AddChainOptions }
  | {
      smoldotClient: Client
      chainSpec: string
      relayChainSpec?: string
      databaseContent?: string
      relayChainDatabaseContent?: string
    }

export const smoldotProvider = async ({
  smoldotClient,
  ...options
}: SmoldotProviderOptions): Promise<JsonRpcProvider> => {
  const provider = await makeJSONRpcProvider(
    smoldotClient,
    "addChainOptions" in options
      ? options.addChainOptions
      : {
          chainSpec: options.chainSpec,
          disableJsonRpc: false,
          potentialRelayChains: options.relayChainSpec
            ? [
                {
                  chainSpec: options.relayChainSpec,
                  disableJsonRpc: true,
                  databaseContent: options.relayChainDatabaseContent,
                },
              ]
            : [],
          databaseContent: options.databaseContent,
        },
  ).pipe(Effect.runPromise)

  return provider
}
