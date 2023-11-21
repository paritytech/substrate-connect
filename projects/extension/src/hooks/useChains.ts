import {
  helper,
  PageChain,
} from "@polkadot-api/light-client-extension-helpers/extension-page"
import { getObservableClient } from "@polkadot-api/client"
import {
  createClient,
  type FollowEventWithRuntime,
} from "@polkadot-api/substrate-client"
import { useEffect, useState } from "react"
import { combineKeys } from "@react-rxjs/utils"
import {
  combineLatest,
  Observable,
  distinct,
  exhaustMap,
  filter,
  map,
  retry,
  scan,
  startWith,
  switchMap,
  share,
  finalize,
  defer,
  mergeMap,
  tap,
  timer,
} from "rxjs"
import { fromHex } from "@polkadot-api/utils"
import { compact } from "scale-ts"

const wellKnownChainIdByGenesisHash: Record<string, string> = {
  "0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3":
    "polkadot",
  "0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe":
    "ksmcc3",
  "0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e":
    "westend2",
  "0x6408de7737c59c238890533af25896a2c20608d8b380bb01029acb392781063e":
    "rococo_v2_2",
}

type Chain = {
  genesisHash: string
  chainName: string
  isWellKnown: boolean
  details: ChainDetails[]
}

type ChainDetails = {
  tabId?: number
  url?: string
  peers: number
  isSyncing: boolean
  chainId: string
  bestBlockHeight?: number
}

export const useChains = () => {
  const [chains, setChains] = useState([] as Chain[])
  useEffect(() => {
    const subscription = chains$.subscribe(setChains)
    return () => subscription.unsubscribe()
  }, [])
  return chains
}

const activeConnectionsAndTabs$ = timer(0, 2000).pipe(
  switchMap(async () => {
    const [connections, tabs] = await Promise.all([
      helper.getActiveConnections(),
      chrome.tabs.query({
        url: ["https://*/*", "http://*/*"],
      }),
    ])
    const tabIds = new Set(
      tabs.map(({ id }) => id).filter((id): id is number => !!id),
    )
    return [connections.filter(({ tabId }) => tabIds.has(tabId)), tabs] as const
  }),
  share(),
)

const activeChains$ = activeConnectionsAndTabs$.pipe(
  map(([connections, tabs]) => {
    const urlByTabId = Object.fromEntries(
      tabs.map(({ id, url }) => [id!, { id: id!, url }]),
    )
    const chainDetailsByGenesisHash = connections.reduce(
      (chainDetails, { chain: { genesisHash }, tabId }) => {
        chainDetails[genesisHash] ??= []
        chainDetails[genesisHash].push({ tabId, url: urlByTabId[tabId]?.url })
        return chainDetails
      },
      {} as Record<string, { tabId: number; url?: string }[]>,
    )
    const chains = Object.values(
      connections.reduce(
        (chains, { chain }) => {
          chains[chain.genesisHash] ??= chain
          return chains
        },
        {} as Record<string, PageChain>,
      ),
    )
    return chains.map(({ genesisHash, name: chainName }) => ({
      genesisHash,
      chainName,
      isWellKnown: !!wellKnownChainIdByGenesisHash[genesisHash],
      details: chainDetailsByGenesisHash[genesisHash].map(({ tabId, url }) => ({
        tabId,
        url,
        peers: 0,
        isSyncing: true,
        // FIXME: How to compute chainId for non-wellKnownChains?
        chainId: wellKnownChainIdByGenesisHash[genesisHash] ?? genesisHash,
        bestBlockHeight: undefined,
      })),
    }))
  }),
)

const createChainDetailObservable = (chain: PageChain) =>
  defer(() => {
    console.log(">> createChainDetailObservable", chain.genesisHash)
    const client = createClient(chain.provider)
    const observableClient = getObservableClient(client)
    const { follow$, unfollow, header$ } = observableClient.chainHead$()
    const followWithRetry$ = follow$.pipe(
      retry({ count: 3, resetOnSuccess: true }),
    )
    const bestBlockHeight$ = followWithRetry$.pipe(
      filter(
        (
          block,
        ): block is FollowEventWithRuntime & {
          type: "bestBlockChanged"
        } => block.type === "bestBlockChanged" && !!block.bestBlockHash,
      ),
      exhaustMap(({ bestBlockHash }) =>
        header$(bestBlockHash).pipe(
          filter(Boolean),
          map((header) => compact.dec(fromHex(header).slice(32)) as number),
        ),
      ),
      startWith(undefined),
    )
    const peers$ = timer(0, 5000).pipe(
      switchMap(
        () =>
          new Promise<number>((resolve, reject) => {
            client._request("system_health", [], {
              onSuccess(result: any) {
                resolve(result?.peers)
              },
              onError: reject,
            })
          }),
      ),
      distinct(),
      startWith(0),
    )
    const isSyncing$ = followWithRetry$.pipe(
      scan((acc, { type }) => (type === "initialized" ? false : acc), true),
      distinct(),
      startWith(true),
    )
    return combineLatest([bestBlockHeight$, peers$, isSyncing$]).pipe(
      map(([bestBlockHeight, peers, isSyncing]) => ({
        bestBlockHeight,
        peers,
        isSyncing,
      })),
      tap((obj) => console.log(">> tap", chain.genesisHash, obj)),
      finalize(() => {
        console.log(
          ">> createChainDetailObservable finalize",
          chain.genesisHash,
        )
        observableClient.destroy()
        unfollow()
      }),
    )
  })

const lazyScan =
  <Acc, Item>(reducer: (acc: Acc, value: Item) => Acc, getInit: () => Acc) =>
  (base: Observable<Item>): Observable<Acc> =>
    defer(() => base.pipe(scan(reducer, getInit())))

type ActiveChainUpdateEvent =
  | { type: "add"; chain: PageChain }
  | { type: "remove"; genesisHash: string }

const activeChainUpdates$: Observable<ActiveChainUpdateEvent> =
  activeConnectionsAndTabs$.pipe(
    lazyScan(
      ([activeChains], [connections]) => {
        const connectionsGenesisHashes = connections.map(
          ({ chain }) => chain.genesisHash,
        )
        const changes: ActiveChainUpdateEvent[] = []
        for (const genesisHash of activeChains) {
          if (connectionsGenesisHashes.includes(genesisHash)) continue
          activeChains.delete(genesisHash)
          changes.push({ type: "remove", genesisHash })
        }
        for (const { chain } of connections) {
          if (activeChains.has(chain.genesisHash)) continue
          activeChains.add(chain.genesisHash)
          changes.push({ type: "add", chain })
        }
        return [activeChains, changes] as const
      },
      () => [new Set<string>(), [] as ActiveChainUpdateEvent[]] as const,
    ),
    mergeMap(([_, changes]) => changes),
    tap((e) => console.log(">> chainUpdate", e)),
    share(),
  )
const activeChainDetails$ = combineKeys(
  activeChainUpdates$.pipe(
    lazyScan(
      (acc, e) => {
        if (e.type === "add") {
          acc[e.chain.genesisHash] = e.chain
        } else {
          delete acc[e.genesisHash]
        }
        return acc
      },
      () => ({}) as Record<string, PageChain>,
    ),
    map((chains) => Object.values(chains)),
  ),
  createChainDetailObservable,
).pipe(
  map((input) => {
    const out = {} as Record<
      string,
      Pick<ChainDetails, "bestBlockHeight" | "isSyncing" | "peers">
    >
    for (const [chain, details] of input) {
      out[chain.genesisHash] = details
    }
    return out
  }),
  startWith(
    {} as Record<
      string,
      Pick<ChainDetails, "bestBlockHeight" | "isSyncing" | "peers">
    >,
  ),
)

const chains$ = combineLatest([activeChains$, activeChainDetails$]).pipe(
  map(([activeChains, activeChainDetails]) =>
    activeChains.map((chain) => ({
      ...chain,
      details: chain.details.map((detail) => ({
        ...detail,
        ...activeChainDetails[chain.genesisHash],
      })),
    })),
  ),
  share(),
)
