type RpcRequestMessage = { id?: string; method: string; params?: any[] }
type RpcResponseMessage =
  | { id: string; result: any }
  | {
      id: string
      error: { code: number; message: string; data?: any }
    }

export type RpcMessage = RpcRequestMessage | RpcResponseMessage

type RpcMethod = (...params: any[]) => any | Promise<any>

type RpcSpec = Record<string, RpcMethod>

export type RpcMethodHandlers<TRpcSpec extends RpcSpec, TContext = void> = {
  [method in keyof TRpcSpec]: (
    params: Parameters<TRpcSpec[method]>,
    context: TContext,
  ) => ReturnType<TRpcSpec[method]>
}

export type RpcMethodMiddleware<Context = any> = (
  next: RpcMethodMiddlewareNext<Context>,
  request: RpcRequestMessage,
  context: Context,
) => Promise<any>

type RpcMethodMiddlewareNext<Context> = (
  request: RpcRequestMessage,
  context: Context,
) => Promise<any>

export const createRpc = <TContext>(
  sendMessage: (message: RpcMessage) => void,
  handlers?: RpcMethodHandlers<RpcSpec, TContext>,
  middlewares?: RpcMethodMiddleware<TContext>[],
) => {
  let nextId = 0
  const pending = new Map<
    string,
    { resolve: (r: any) => void; reject: (e: any) => void }
  >()
  middlewares ??= []
  middlewares.unshift(
    createResponseMiddleware(sendMessage),
    createIsValidMethodMiddleware(Object.keys(handlers ?? {})),
  )
  const applyMiddleware = middlewares.reduce(
    (prevMiddleware, nextMiddleware) => (next, message, context) =>
      prevMiddleware(
        (request, context) => nextMiddleware(next, request, context),
        message,
        context,
      ),
  )
  const innerMethodHandler: RpcMethodMiddlewareNext<TContext> = (
    { method, params },
    context,
  ) => handlers?.[method]?.(params ?? [], context)
  const methodHandler = (message: RpcRequestMessage, context: TContext) =>
    applyMiddleware(innerMethodHandler, message, context)
  const request = <T>(method: string, params: any[]) => {
    const id = `${nextId++}`
    sendMessage({ id, method, params })
    return new Promise<T>((resolve, reject) =>
      pending.set(id, { resolve, reject }),
    )
  }
  const notify = (method: string, params: any[]) => {
    sendMessage({ method, params })
  }
  const handle = async (message: RpcMessage, context: TContext) => {
    if (!isRpcMessage(message)) return
    if ("method" in message) {
      try {
        await methodHandler(message, context)
      } catch (error) {
        console.error("error handling message:", message, error)
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
  }
  return {
    request,
    notify,
    handle,
    withClient<TRpcSpec extends RpcSpec>() {
      const cache = new Map<string, (...args: any[]) => any>()
      const client = new Proxy({} as TRpcSpec, {
        get(_, prop: string) {
          if (!cache.has(prop))
            cache.set(prop, (...args) => request(prop, args))
          return cache.get(prop)!
        },
      })
      return {
        request<
          TMethod extends string & keyof TRpcSpec,
          TParams extends Parameters<TRpcSpec[TMethod]>,
          TReturn extends Awaited<ReturnType<TRpcSpec[TMethod]>>,
        >(method: TMethod, params: TParams) {
          return request<TReturn>(method, params)
        },
        notify<
          TMethod extends string & keyof TRpcSpec,
          TParams extends Parameters<TRpcSpec[TMethod]>,
        >(method: TMethod, params: TParams) {
          notify(method, params)
        },
        handle,
        client,
      }
    },
  }
}

export const isRpcMessage = (message: any): message is RpcMessage =>
  typeof message === "object" && ("method" in message || "id" in message)

export const isRpcRequestMessage = (
  message: any,
): message is RpcRequestMessage => isRpcMessage(message) && "method" in message

// export const logMiddleware: MethodMiddleware = (next, message, _context) => {
//   console.log(`> Received ${JSON.stringify(message)}`)
//   return next(message, _context).then((response) => {
//     console.log(`< Responding ${JSON.stringify(response)}`)
//     return response
//   })
// }

const createIsValidMethodMiddleware =
  (methods: string[]): RpcMethodMiddleware =>
  (next, request, context) => {
    if (!methods.includes(request.method))
      throw new RpcError("Method not found", -32601)
    return next(request, context)
  }

const createResponseMiddleware =
  (sendMessage: (message: RpcResponseMessage) => void): RpcMethodMiddleware =>
  async (next, request, context) => {
    const { id } = request
    try {
      const result = await next(request, context)
      if (!id) return
      sendMessage({ id, result })
    } catch (error) {
      if (!id) return
      if (error instanceof RpcError)
        sendMessage({
          id,
          error: {
            code: error.code,
            message: error.message,
            data: error.data,
          },
        })
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
  }

export class RpcError extends Error {
  constructor(
    message: string,
    readonly code: number,
    readonly data?: any,
  ) {
    super(message)
  }
}
