import { getObservableClient } from "@polkadot-api/client"
import { Enum } from "@polkadot-api/substrate-bindings"
import type { SS58String } from "@polkadot-api/substrate-bindings"
import {
  ConnectProvider,
  TxEvent,
  createClient,
} from "@polkadot-api/substrate-client"
import { getDynamicBuilder } from "@polkadot-api/metadata-builders"
import { firstValueFrom, filter, map, tap, ReplaySubject } from "rxjs"
import { mergeUint8, toHex } from "@polkadot-api/utils"
import { UnstableWallet } from "@substrate/unstable-wallet-provider"
import { ss58Decode } from "@polkadot-labs/hdkd-helpers"

const AccountId = (value: SS58String) =>
  Enum<
    {
      type: "Id"
      value: SS58String
    },
    "Id"
  >("Id", value)

type Provider = UnstableWallet.Provider & { connect: ConnectProvider }

export const useTransfer = (provider: Provider, chainId: string) => {
  const transfer = async (
    sender: SS58String,
    destination: SS58String,
    amount: bigint,
  ) => {
    const client = getObservableClient(createClient(provider.connect))
    const { metadata$ } = client.chainHead$()

    const callData = await firstValueFrom(
      metadata$.pipe(
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
      ),
    )

    const tx = await provider.createTx(
      chainId,
      toHex(ss58Decode(sender)[0]),
      callData,
    )
    const txEvents = new ReplaySubject<TxEvent>()

    client.tx$(tx).pipe(tap(txEvents)).subscribe()

    return { tx, txEvents }
  }

  return { transfer }
}
