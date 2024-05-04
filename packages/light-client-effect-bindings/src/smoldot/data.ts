import { Data } from "effect"

export class AddChainError extends Data.TaggedError("AddChainError") {}

export class AlreadyDestroyedError extends Data.TaggedError(
  "AlreadyDestroyedError",
) {}

export class JsonRpcDisabledError extends Data.TaggedError(
  "JsonRpcDisabledError",
) {}

export class CrashError extends Data.TaggedError("CrashError") {}

export class QueueFullError extends Data.TaggedError("QueueFullError") {}
