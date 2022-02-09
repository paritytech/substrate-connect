export class AlreadyDestroyedError extends Error {
  constructor() {
    super()
    this.name = "AlreadyDestroyedError"
  }
}

export class CrashError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "CrashError"
  }
}

export class JsonRpcDisabledError extends Error {
  constructor() {
    super()
    this.name = "JsonRpcDisabledError"
  }
}
