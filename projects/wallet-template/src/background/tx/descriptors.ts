import type { DescriptorValues } from "@polkadot-api/codegen"

export type PlainDescriptor<T> = { _type?: T }
export type AssetDescriptor<T> = string & { _type?: T }
export type StorageDescriptor<
  Args extends Array<any>,
  T,
  Optional extends true | false,
> = { _type: T; _args: Args; _optional: Optional }

export type TxDescriptor<Args extends {} | undefined> = {
  ___: Args
}

export type RuntimeDescriptor<Args extends Array<any>, T> = [Args, T]

// pallet -> name -> descriptor
export type DescriptorEntry<T> = Record<string, Record<string, T>>

export type PalletsTypedef<
  St extends DescriptorEntry<StorageDescriptor<any, any, any>>,
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

export { DescriptorValues }

export type ChainDefinition = {
  descriptors: Promise<DescriptorValues> & {
    pallets: PalletsTypedef<any, any, any, any, any>
    apis: ApisTypedef<any>
  }
  asset: AssetDescriptor<any>
  checksums: Promise<string[]>
}

type ExtractStorage<
  T extends DescriptorEntry<StorageDescriptor<any, any, any>>,
> = {
  [K in keyof T]: {
    [KK in keyof T[K]]: T[K][KK] extends StorageDescriptor<
      infer Key,
      infer Value,
      infer Optional
    >
      ? {
          KeyArgs: Key
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
