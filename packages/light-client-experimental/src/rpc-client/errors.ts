import { ParseError } from "@effect/schema/ParseResult"
import { Data } from "effect"

export class InvalidJSONRPCResponseError extends Data.TaggedError(
  "InvalidJSONRPCResponseError",
)<{ cause: ParseError }> {}
