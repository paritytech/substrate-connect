import type { DescriptorValues } from "@polkadot-api/codegen"
import type { OpaqueKeyHash } from "@polkadot-api/substrate-bindings"
import type { FixedSizeArray } from "./types.js"

export type PlainDescriptor<T> = { _type?: T }
export type StorageDescriptor<
  Args extends Array<any>,
  T,
  Optional extends true | false,
  Opaque extends string,
> = { _type: T; _args: Args; _optional: Optional; _Opaque: Opaque }

export type TxDescriptor<Args extends {} | undefined> = {
  ___: Args
}

export type RuntimeDescriptor<Args extends Array<any>, T> = [Args, T]

// pallet -> name -> descriptor
export type DescriptorEntry<T> = Record<string, Record<string, T>>

export type PalletsTypedef<
  St extends DescriptorEntry<StorageDescriptor<any, any, any, any>>,
  Tx extends DescriptorEntry<TxDescriptor<any>>,
  Ev extends DescriptorEntry<PlainDescriptor<any>>,
  Err extends DescriptorEntry<PlainDescriptor<any>>,
  Ct extends DescriptorEntry<PlainDescriptor<any>>,
> = {
  __storage: St
  __tx: Tx
  __event: Ev
  __error: Err
  __const: Ct
}

export type ApisTypedef<
  T extends DescriptorEntry<RuntimeDescriptor<any, any>>,
> = T

export type { DescriptorValues }

export type ChainDefinition = {
  descriptors: Promise<DescriptorValues> & {
    pallets: PalletsTypedef<any, any, any, any, any>
    apis: ApisTypedef<any>
  }
  asset: PlainDescriptor<any>
  metadataTypes: Promise<Uint8Array>
}

type BuildTuple<L extends number, E, R extends Array<E>> = R["length"] extends L
  ? R
  : BuildTuple<L, E, [E, ...R]>
type UnwrapFixedSizeArray<T extends Array<any>> = T extends [] | [any, ...any[]]
  ? T
  : T extends FixedSizeArray<infer L, infer E>
    ? number extends L
      ? T
      : BuildTuple<L, E, []>
    : T
type RemapKeys<Key extends Array<any>, Opaque> = {
  [K in keyof Key]: K extends Opaque ? OpaqueKeyHash : Key[K]
}
type ApplyOpaque<Key extends Array<any>, Opaque> = never extends Opaque
  ? Key
  : RemapKeys<UnwrapFixedSizeArray<Key>, Opaque>

type ExtractStorage<
  T extends DescriptorEntry<StorageDescriptor<any, any, any, any>>,
> = {
  [K in keyof T]: {
    [KK in keyof T[K]]: T[K][KK] extends StorageDescriptor<
      infer Key,
      infer Value,
      infer Optional,
      infer Opaque
    >
      ? {
          KeyArgs: Key
          KeyArgsOut: ApplyOpaque<Key, Opaque>
          Value: Value
          IsOptional: Optional
        }
      : unknown
  }
}

type ExtractTx<T extends DescriptorEntry<TxDescriptor<any>>> = {
  [K in keyof T]: {
    [KK in keyof T[K]]: T[K][KK] extends TxDescriptor<infer Args>
      ? Args
      : unknown
  }
}

type ExtractPlain<T extends DescriptorEntry<PlainDescriptor<any>>> = {
  [K in keyof T]: {
    [KK in keyof T[K]]: T[K][KK] extends PlainDescriptor<infer Value>
      ? Value
      : unknown
  }
}

export type QueryFromPalletsDef<
  T extends PalletsTypedef<any, any, any, any, any>,
> = ExtractStorage<T["__storage"]>

export type TxFromPalletsDef<
  T extends PalletsTypedef<any, any, any, any, any>,
> = ExtractTx<T["__tx"]>

export type EventsFromPalletsDef<
  T extends PalletsTypedef<any, any, any, any, any>,
> = ExtractPlain<T["__event"]>

export type ErrorsFromPalletsDef<
  T extends PalletsTypedef<any, any, any, any, any>,
> = ExtractPlain<T["__error"]>

export type ConstFromPalletsDef<
  T extends PalletsTypedef<any, any, any, any, any>,
> = ExtractPlain<T["__const"]>
