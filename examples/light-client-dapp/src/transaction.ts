import { getObservableClient } from "@polkadot-api/client"
import { Enum } from "@polkadot-api/substrate-bindings"
import type { SS58String } from "@polkadot-api/substrate-bindings"
import { ConnectProvider, createClient } from "@polkadot-api/substrate-client"
import { getDynamicBuilder } from "@polkadot-api/metadata-builders"
import { filter, map, mergeMap, first } from "rxjs"
import { mergeUint8, toHex } from "@polkadot-api/utils"
import { UnstableWallet } from "@substrate/unstable-wallet-provider"
import { ss58Decode } from "@polkadot-labs/hdkd-helpers"
import { fromPromise } from "rxjs/internal/observable/innerFrom"

const AccountId = (value: SS58String) =>
  Enum<
    {
      type: "Id"
      value: SS58String
    },
    "Id"
  >("Id", value)

type Provider = UnstableWallet.Provider & { connect: ConnectProvider }

export const transaction = (
  provider: Provider,
  chainId: string,
  from: SS58String,
  callData: string,
) => {
  const client = getObservableClient(createClient(provider.connect))

  return fromPromise(
    provider.createTx(chainId, toHex(ss58Decode(from)[0]), callData),
  ).pipe(
    mergeMap((tx) => client.tx$(tx).pipe(map((txEvent) => ({ tx, txEvent })))),
  )
}

export const transferAllowDeathCallData = (
  provider: Provider,
  destination: SS58String,
  amount: bigint,
) => {
  const client = getObservableClient(createClient(provider.connect))
  const { metadata$ } = client.chainHead$()

  return metadata$.pipe(
    filter(Boolean),
    map((metadata) => {
      const dynamicBuilder = getDynamicBuilder(metadata)
      const { location, args } = dynamicBuilder.buildCall(
        "Balances",
        "transfer_allow_death",
      )

      return toHex(
        mergeUint8(
          new Uint8Array(location),
          args.enc({
            dest: AccountId(destination),
            value: amount,
          }),
        ),
      )
    }),
    first(),
  )
}
