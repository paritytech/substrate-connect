import { Blake2256, HexString } from "@polkadot-api/substrate-bindings"
import {
  EMPTY,
  Observable,
  concat,
  distinctUntilChanged,
  filter,
  lastValueFrom,
  map,
  mergeMap,
  of,
  take,
} from "rxjs"
import {
  ChainHead$,
  PinnedBlocks,
  SystemEvent,
} from "@polkadot-api/observable-client"
import { AnalyzedBlock } from "@polkadot-api/observable-client"
import { TxEvent, TxEventsPayload, TxFinalizedPayload } from "./types"
import { continueWith } from "@/utils"
import { fromHex, toHex } from "@polkadot-api/utils"

// TODO: make it dynamic based on the tx-function of the client
const hashFromTx = (tx: HexString) => toHex(Blake2256(fromHex(tx)))

const computeState = (
  analized$: Observable<AnalyzedBlock>,
  blocks$: Observable<PinnedBlocks>,
) =>
  new Observable<
    | {
        hash: string
        index: number
        events: any
      }
    | boolean
  >((observer) => {
    const analyzedBlocks = new Map<string, AnalyzedBlock>()
    let pinnedBlocks: PinnedBlocks
    let latestState:
      | {
          hash: string
          index: number
          events: any
        }
      | boolean

    const computeNextState = () => {
      let current: string = pinnedBlocks.best
      let analyzed: AnalyzedBlock | undefined = analyzedBlocks.get(current)

      while (!analyzed) {
        const block = pinnedBlocks.blocks.get(current)
        if (!block) break
        analyzed = analyzedBlocks.get((current = block.parent))
      }

      if (!analyzed) return // this shouldn't happen, though

      const isFinalized =
        pinnedBlocks.blocks.get(analyzed.hash)!.number <=
        pinnedBlocks.blocks.get(pinnedBlocks.finalized)!.number

      const found = analyzed.found.type
      if (
        found &&
        typeof latestState === "object" &&
        latestState.hash === analyzed.hash
      ) {
        if (isFinalized) observer.complete()
        return
      }

      observer.next(
        (latestState = found
          ? {
              hash: analyzed.hash,
              ...analyzed.found,
            }
          : analyzed.found.isValid),
      )

      if (isFinalized) {
        if (found) observer.complete()
        else if (!analyzed.found.isValid) observer.error(new Error("Invalid"))
      }
    }

    const subscription = blocks$
      .pipe(
        distinctUntilChanged(
          (a, b) => a.finalized === b.finalized && a.best === b.best,
        ),
      )
      .subscribe({
        next: (pinned: PinnedBlocks) => {
          pinnedBlocks = pinned
          if (analyzedBlocks.size === 0) return
          computeNextState()
        },
        error(e) {
          observer.error(e)
        },
      })

    subscription.add(
      analized$.subscribe({
        next: (block) => {
          analyzedBlocks.set(block.hash, block)
          computeNextState()
        },
        error(e) {
          observer.error(e)
        },
      }),
    )

    return subscription
  }).pipe(distinctUntilChanged((a, b) => a === b))

const getTxSuccessFromSystemEvents = (
  systemEvents: Array<SystemEvent>,
  txIdx: number,
): Omit<TxEventsPayload, "block"> => {
  const events = systemEvents
    .filter((x) => x.phase.type === "ApplyExtrinsic" && x.phase.value === txIdx)
    .map((x) => x.event)

  const lastEvent = events[events.length - 1]
  const ok =
    lastEvent.type === "System" && lastEvent.value.type === "ExtrinsicSuccess"

  return { ok, events }
}

export const submit$ = (
  chainHead: ChainHead$,
  broadcastTx$: (tx: string) => Observable<never>,
  tx: HexString,
  at?: HexString,
  emitSign = false,
): Observable<TxEvent> => {
  const txHash = hashFromTx(tx)
  const getTxEvent = <
    Type extends TxEvent["type"],
    Rest extends Omit<TxEvent & { type: Type }, "type" | "txHash">,
  >(
    type: Type,
    rest: Rest,
  ): TxEvent & { type: Type } =>
    ({
      type,
      txHash,
      ...rest,
    }) as any

  const at$ = chainHead.pinnedBlocks$.pipe(
    take(1),
    map((blocks) => blocks.blocks.get(at!)?.hash ?? blocks.finalized),
  )

  const validate$: Observable<never> = at$.pipe(
    mergeMap((at) =>
      chainHead.validateTx$(at, tx).pipe(
        filter((x) => !x),
        map(() => {
          throw new Error("Invalid")
        }),
      ),
    ),
  )

  const track$ = new Observable<AnalyzedBlock>((observer) => {
    const subscription = chainHead.trackTx$(tx).subscribe(observer)
    subscription.add(
      broadcastTx$(tx).subscribe({
        error(e) {
          observer.error(e)
        },
      }),
    )
    return subscription
  })

  const bestBlockState$ = computeState(track$, chainHead.pinnedBlocks$).pipe(
    map((x) => {
      if (x === true || x === false)
        return getTxEvent("txBestBlocksState", {
          found: false,
          isValid: x,
        })

      return getTxEvent("txBestBlocksState", {
        found: true,
        block: {
          index: x.index,
          hash: x.hash,
        },
        ...getTxSuccessFromSystemEvents(x.events, x.index),
      })
    }),
  )

  return concat(
    emitSign ? of(getTxEvent("signed", {})) : EMPTY,
    validate$,
    of(getTxEvent("broadcasted", {})),
    bestBlockState$.pipe(
      continueWith(({ found, type, ...rest }) =>
        found ? of(getTxEvent("finalized", rest as any)) : EMPTY,
      ),
    ),
  )
}

export const submit = async (
  chainHead: ChainHead$,
  broadcastTx$: (tx: string) => Observable<never>,
  transaction: HexString,
  at?: HexString,
): Promise<TxFinalizedPayload> =>
  lastValueFrom(submit$(chainHead, broadcastTx$, transaction, at)).then((x) => {
    if (x.type !== "finalized") throw null
    const result: TxFinalizedPayload = { ...x }
    delete (result as any).type
    return result
  })
