export type RpcMessage =
  | { id?: string; method: string; params?: any[] }
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
    request<
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
    notify<
      TMethod extends string & keyof THandlers,
      TParams extends Parameters<THandlers[TMethod]>,
    >(method: TMethod, params: TParams) {
      sendMessage({ method, params })
    },
    async handle(message: RpcMessage) {
      if (!isRpcMessage(message)) return
      if ("method" in message) {
        const { id } = message
        const handler = handlers?.[message.method]
        if (!handler) {
          id &&
            sendMessage({
              id,
              error: { code: -32601, message: "Method not found" },
            })
          return
        }
        try {
          const result = await handler(...(message.params ?? []))
          id && sendMessage({ id, result })
        } catch (error) {
          id &&
            sendMessage({
              id,
              error: {
                code: -32603,
                message:
                  error instanceof Error
                    ? error.toString()
                    : typeof error === "string"
                      ? error
                      : "Unknown error",
              },
            })
        }
      } else if ("id" in message) {
        const { id } = message
        if (!pending.has(id))
          return console.assert(false, "Unknown message", message)
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

export type Rpc<T extends Handlers = any> = ReturnType<typeof createRpc<T>>

export const isRpcMessage = (message: any): message is RpcMessage =>
  typeof message === "object" && ("method" in message || "id" in message)

export const isRpcRequestMessage = (
  message: any,
): message is RpcMessage & { method: string } =>
  isRpcMessage(message) && "method" in message
