/**
 * Creates an asynchronous first-in-first-out queue.
 *
 * This function returns a synchronous function named `push` that can be used to push messages
 * to the back of the queue, and an asynchronous function named `pull` that can be used to pull
 * messages from the front of the queue.
 *
 * If `pull` is called and the queue is empty, it will wait until `push` is called.
 */
export default function createAsyncFifoQueue<Message>(): {
  push: (message: Message) => void
  pull: () => Promise<Message>
} {
  // The `resolve` function of the last `Promise` of the queue.
  let messagesQueueBack: null | ((item: [Message, Stream<Message>]) => void) =
    null

  // A `Promise` that resolves to a tuple of `[Message, Promise]`. The second element of the tuple
  // is a `Promise` to the following message.
  // In order to pull an element from the queue, wait for this promise, then overwrite
  // `messagesQueueFront` with the yielded `̀Promise`.
  //
  // `null` must be pushed when the sandbox is destroyed, in order to interrupt any function
  // currently waiting for a message.
  let messagesQueueFront = new Promise<[Message, Stream<Message>]>((r, _) => {
    messagesQueueBack = r
  })

  const push = (message: Message) => {
    let resolve: null | ((item: [Message, Stream<Message>]) => void) = null
    const nextMessage = new Promise<[Message, Stream<Message>]>((r, _) => {
      resolve = r
    })

    messagesQueueBack!([message, nextMessage])
    messagesQueueBack = resolve!
  }

  const pull = async (): Promise<Message> => {
    const queueFront = messagesQueueFront
    const [message, nextFront] = await queueFront
    // We check whether the queue front is still the same, in case the API user called this
    // function multiple times.
    if (messagesQueueFront === queueFront) messagesQueueFront = nextFront
    return message
  }

  return { push, pull }
}

type Stream<Message> = Promise<[Message, Stream<Message>]>
