type RpcMessage =
  | { id: string; method: string; params?: any[] }
  | { id: string; result: any }
  | {
      id: string
      error: { code: number; message: string; data?: any }
    }

type Handlers = Record<string, (...args: any[]) => any | Promise<any>>

export const createRpc = <THandlers extends Handlers>(
  sendMessage: (message: RpcMessage) => void,
  handlers?: Handlers,
) => {
  let nextId = 0
  const pending = new Map<
    string,
    { resolve: (r: any) => void; reject: (e: any) => void }
  >()
  return {
    call<
      TMethod extends string & keyof THandlers,
      TParams extends Parameters<THandlers[TMethod]>,
      TReturn extends Awaited<ReturnType<THandlers[TMethod]>>,
    >(method: TMethod, params: TParams) {
      const id = `${nextId++}`
      sendMessage({ id, method, params })
      return new Promise<TReturn>((resolve, reject) =>
        pending.set(id, { resolve, reject }),
      )
    },
    async handle(message: RpcMessage) {
      if (!isRpcMessage(message)) return
      if ("method" in message) {
        const { id } = message
        const handler = handlers?.[message.method]
        if (!handler)
          return sendMessage({
            id,
            error: { code: -32601, message: "Method not found" },
          })
        try {
          const result = await handler(...(message.params ?? []))
          sendMessage({ id, result })
        } catch (error) {
          sendMessage({
            id,
            error: {
              code: -32603,
              message:
                error instanceof Error ? error.toString() : "Unknown error",
            },
          })
        }
      } else if ("result" in message || "error" in message) {
        const { id } = message
        if (!pending.has(id)) return
        const { resolve, reject } = pending.get(id)!
        pending.delete(id)
        if ("error" in message) return reject(message.error)
        resolve(message.result)
      } else {
        console.assert(false, "Unhandled message", message)
      }
    },
  }
}

const isRpcMessage = (message: any): message is RpcMessage => {
  return (
    typeof message === "object" &&
    "id" in message &&
    ("method" in message || "result" in message || "error" in message)
  )
}
