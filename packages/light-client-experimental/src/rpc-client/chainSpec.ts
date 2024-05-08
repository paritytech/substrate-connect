import * as S from "@effect/schema/Schema"

import type { SubstrateClient } from "@polkadot-api/substrate-client"
import { Cause, Effect, pipe as $, flow as _ } from "effect"
import { InvalidJSONRPCResponseError } from "./errors"

export type ChainSpecRPC = {
  genesisHash: Effect.Effect<
    string,
    InvalidJSONRPCResponseError | Cause.UnknownException,
    never
  >
  chainName: Effect.Effect<
    string,
    InvalidJSONRPCResponseError | Cause.UnknownException,
    never
  >
  properties: Effect.Effect<unknown, Cause.UnknownException, never>
}

/** @internal */
export type Client = Omit<
  SubstrateClient,
  "transaction" | "_request" | "destroy"
>

/** @internal */
export const make = (
  client: Client,
): Effect.Effect<ChainSpecRPC, never, never> => {
  return Effect.gen(function* () {
    const genesisHash: ChainSpecRPC["genesisHash"] = $(
      Effect.tryPromise((abort) =>
        client.request("chainSpec_v1_genesisHash", [], abort),
      ),
      Effect.andThen(
        _(
          S.decodeUnknown(S.String),
          Effect.mapError(
            (err) => new InvalidJSONRPCResponseError({ cause: err }),
          ),
        ),
      ),
      Effect.withSpan("chainSpec/v1/genesisHash"),
    )

    const chainName: ChainSpecRPC["chainName"] = $(
      Effect.tryPromise((abort) =>
        client.request("chainSpec_v1_chainName", [], abort),
      ),
      Effect.andThen(
        _(
          S.decodeUnknown(S.String),
          Effect.mapError(
            (err) => new InvalidJSONRPCResponseError({ cause: err }),
          ),
        ),
      ),
      Effect.withSpan("chainSpec/v1/genesisHash"),
    )

    const properties: ChainSpecRPC["properties"] = $(
      Effect.tryPromise((abort) =>
        client.request("chainSpec_v1_properties", [], abort),
      ),
      Effect.withSpan("chainSpec/v1/properties"),
    )

    return {
      genesisHash,
      chainName,
      properties,
    }
  })
}
