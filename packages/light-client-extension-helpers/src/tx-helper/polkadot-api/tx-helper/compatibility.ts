import { MetadataLookup } from "@polkadot-api/metadata-builders"
import {
  CompatibilityCache,
  CompatibilityLevel,
  EntryPoint,
  EntryPointCodec,
  TypedefCodec,
  TypedefNode,
  entryPointsAreCompatible,
  mapLookupToTypedef,
  valueIsCompatibleWithDest,
} from "@polkadot-api/metadata-compatibility"
import {
  ChainHead$,
  getObservableClient,
  RuntimeContext,
} from "@polkadot-api/observable-client"
import { Tuple, Vector } from "@polkadot-api/substrate-bindings"
import { Observable, combineLatest, filter, firstValueFrom, map } from "rxjs"
import { ChainDefinition } from "./descriptors"

export class CompatibilityToken<D = unknown> {
  private constructor() {}

  // @ts-ignore
  protected _phantom(value: D) {}
}

interface CompatibilityTokenApi {
  runtime: () => RuntimeContext
  typedefNodes: TypedefNode[]
  getPalletEntryPoint: (
    opType: OpType,
    pallet: string,
    name: string,
  ) => EntryPoint
  getApiEntryPoint: (name: string, method: string) => EntryPoint
}
const compatibilityTokenApi = new WeakMap<
  CompatibilityToken,
  CompatibilityTokenApi
>()
export const getCompatibilityApi = (token: CompatibilityToken) =>
  compatibilityTokenApi.get(token)!

export const enum OpType {
  Storage = "storage",
  Tx = "tx",
  Event = "events",
  Error = "errors",
  Const = "constants",
}

const EntryPointsCodec = Vector(EntryPointCodec)
const TypedefsCodec = Vector(TypedefCodec)
const TypesCodec = Tuple(EntryPointsCodec, TypedefsCodec)

export const createCompatibilityToken = <D extends ChainDefinition>(
  chainDefinition: D,
  chainHead: ReturnType<ReturnType<typeof getObservableClient>["chainHead$"]>,
): Promise<CompatibilityToken<D>> => {
  const awaitedRuntime = new Promise<() => RuntimeContext>(async (resolve) => {
    const loadedRuntime$ = chainHead.runtime$.pipe(filter((v) => v != null))

    let latest = await firstValueFrom(loadedRuntime$)
    loadedRuntime$.subscribe((v) => (latest = v))

    resolve(() => latest)
  })

  const promise = Promise.all([
    chainDefinition.metadataTypes.then(TypesCodec.dec),
    chainDefinition.descriptors,
    awaitedRuntime,
  ]).then(([[entryPoints, typedefNodes], descriptors, runtime]) => {
    const token = new (CompatibilityToken as any)()
    compatibilityTokenApi.set(token, {
      runtime,
      getPalletEntryPoint(opType, pallet, name) {
        return entryPoints[descriptors[opType][pallet][name]]
      },
      getApiEntryPoint(name, method) {
        return entryPoints[descriptors.apis[name][method]]
      },
      typedefNodes,
    })

    return token
  })

  return promise
}

// metadataRaw -> cache
const metadataCache = new WeakMap<
  Uint8Array,
  {
    compat: CompatibilityCache
    lookup: MetadataLookup
    typeNodes: (TypedefNode | null)[]
  }
>()
const getMetadataCache = (ctx: RuntimeContext) => {
  if (!metadataCache.has(ctx.metadataRaw)) {
    metadataCache.set(ctx.metadataRaw, {
      compat: new Map(),
      lookup: ctx.lookup,
      typeNodes: [],
    })
  }
  return metadataCache.get(ctx.metadataRaw)!
}
export const compatibilityHelper = (
  descriptors: Promise<CompatibilityToken>,
  getDescriptorEntryPoint: (descriptorApi: CompatibilityTokenApi) => EntryPoint,
  getRuntimeEntryPoint: (ctx: RuntimeContext) => EntryPoint,
) => {
  const getRuntimeTypedef = (ctx: RuntimeContext, id: number) => {
    const cache = getMetadataCache(ctx)
    return (cache.typeNodes[id] ||= mapLookupToTypedef(cache.lookup(id)))
  }

  function getCompatibilityLevels(
    descriptors: CompatibilityToken,
    /**
     * The `Runtime` of runtimeWithDescriptors already has a RuntimeContext,
     * which is the runtime of the finalized block.
     * But on some cases, the user wants to perform an action on a specific
     * block hash, which has a different RuntimeContext.
     */
    ctx?: RuntimeContext,
  ) {
    const compatibilityApi = compatibilityTokenApi.get(descriptors)!
    ctx ||= compatibilityApi.runtime()
    const descriptorEntryPoint = getDescriptorEntryPoint(compatibilityApi)
    const runtimeEntryPoint = getRuntimeEntryPoint(ctx)
    const descriptorNodes = compatibilityApi.typedefNodes

    const cache = getMetadataCache(ctx)

    return entryPointsAreCompatible(
      descriptorEntryPoint,
      (id) => descriptorNodes[id],
      runtimeEntryPoint,
      (id) => getRuntimeTypedef(ctx, id),
      cache.compat,
    )
  }

  const getCompatibilityLevel = withOptionalToken(descriptors, (runtime) =>
    minCompatLevel(getCompatibilityLevels(runtime)),
  )
  const isCompatible = withOptionalToken(
    descriptors,
    (threshold: CompatibilityLevel, runtime) =>
      getCompatibilityLevel(runtime) >= threshold,
  )

  const waitDescriptors = () => descriptors
  const compatibleRuntime$ = (chainHead: ChainHead$, hash: string | null) =>
    combineLatest([waitDescriptors(), chainHead.getRuntimeContext$(hash)])

  const withCompatibleRuntime =
    <T>(chainHead: ChainHead$, mapper: (x: T) => string) =>
    (
      source$: Observable<T>,
    ): Observable<[T, CompatibilityToken, RuntimeContext]> =>
      combineLatest([
        source$.pipe(chainHead.withRuntime(mapper)),
        waitDescriptors(),
      ]).pipe(map(([[x, ctx], descriptors]) => [x, descriptors, ctx]))

  const argsAreCompatible = (
    descriptors: CompatibilityToken,
    ctx: RuntimeContext,
    args: unknown,
  ) => {
    const levels = getCompatibilityLevels(descriptors, ctx)
    if (levels.args === CompatibilityLevel.Incompatible) return false
    if (levels.args > CompatibilityLevel.Partial) return true
    // Although technically args could still be compatible, if the output will be incompatible we might as well just return false to skip sending the request.
    if (levels.values === CompatibilityLevel.Incompatible) return false

    const entryPoint = getRuntimeEntryPoint(ctx)

    return valueIsCompatibleWithDest(
      entryPoint.args,
      (id) => getRuntimeTypedef(ctx, id),
      args,
    )
  }
  const valuesAreCompatible = (
    descriptors: CompatibilityToken,
    ctx: RuntimeContext,
    values: unknown,
  ) => {
    const level = getCompatibilityLevels(descriptors, ctx).values
    if (level === CompatibilityLevel.Incompatible) return false
    if (level > CompatibilityLevel.Partial) return true

    const compatibilityApi = compatibilityTokenApi.get(descriptors)!

    const entryPoint = getDescriptorEntryPoint(compatibilityApi)

    return valueIsCompatibleWithDest(
      entryPoint.values,
      (id) => compatibilityApi.typedefNodes[id],
      values,
    )
  }

  return {
    isCompatible,
    getCompatibilityLevel,
    getCompatibilityLevels,
    waitDescriptors,
    withCompatibleRuntime,
    compatibleRuntime$,
    argsAreCompatible,
    valuesAreCompatible,
    getRuntimeTypedef,
  }
}
export type CompatibilityHelper = ReturnType<typeof compatibilityHelper>

export const minCompatLevel = (levels: {
  args: CompatibilityLevel
  values: CompatibilityLevel
}) => Math.min(levels.args, levels.values)

const withOptionalToken =
  <T, D, A extends [...any[], CompatibilityToken]>(
    compatibilityToken: Promise<CompatibilityToken<D>>,
    fn: (...args: A) => T,
  ): WithOptionalRuntime<T, D, A extends [...infer R, any] ? R : []> =>
  (...args: any): any => {
    const lastElement = args.at(-1)
    if (lastElement instanceof CompatibilityToken) {
      return fn(...args)
    }
    return compatibilityToken.then((token) => (fn as any)(...args, token))
  }

export type WithOptionalRuntime<T, D, A extends any[]> = {
  /**
   * Returns the result after waiting for the runtime to load.
   */
  (...args: A): Promise<T>
  /**
   * Returns the result synchronously with the loaded runtime.
   */
  (...args: [...A, runtime: CompatibilityToken<D>]): T
}

export interface CompatibilityFunctions<D> {
  /**
   * Returns the `CompatibilityLevel` for this call comparing the descriptors
   * generated on dev time with the current live metadata.
   */
  getCompatibilityLevel(): Promise<CompatibilityLevel>
  /**
   * Returns the `CompatibilityLevel` for this call comparing the descriptors
   * generated on dev time with the current live metadata.
   *
   * @param compatibilityToken  CompatibilityToken awaited from
   *                            typedApi.compatibilityToken.
   */
  getCompatibilityLevel(
    compatibilityToken: CompatibilityToken<D>,
  ): CompatibilityLevel

  /**
   * Returns whether this call is compatible based on the CompatibilityLevel
   * threshold.
   *
   * @param threshold  CompatibilityLevel threshold to use, inclusive.
   */
  isCompatible(threshold: CompatibilityLevel): Promise<boolean>

  /**
   * Returns whether this call is compatible based on the CompatibilityLevel
   * threshold.
   *
   * @param threshold           CompatibilityLevel threshold to use,
   *                            inclusive.
   * @param compatibilityToken  CompatibilityToken awaited from
   *                            typedApi.compatibilityToken.
   */
  isCompatible(
    threshold: CompatibilityLevel,
    compatibilityToken: CompatibilityToken<D>,
  ): boolean
}
