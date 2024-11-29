import {
  withLogsRecorder as _withLogsRecorder,
  logsProvider as _logsProvider,
  type LogsProviderOptions as _LogsProviderOptions,
} from "@polkadot-api/logs-provider"

export type JsonRpcProvider = Parameters<typeof _withLogsRecorder>[1]
export type LogsProviderOptions = Readonly<_LogsProviderOptions>

export const makeLogsProvider =
  (options: Partial<LogsProviderOptions> = {}) =>
  (rawLogs: ReadonlyArray<string>): JsonRpcProvider => {
    return _logsProvider([...rawLogs], options)
  }

export const withLogsRecorder =
  (persistLog: (log: string) => void) =>
  (input: JsonRpcProvider): JsonRpcProvider => {
    return _withLogsRecorder(persistLog, input)
  }
