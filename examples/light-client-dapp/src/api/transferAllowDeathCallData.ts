import { type SS58String, Enum } from "@polkadot-api/substrate-bindings"
import { getDynamicBuilder } from "@polkadot-api/metadata-builders"
import { filter, map, firstValueFrom } from "rxjs"
import { mergeUint8, toHex } from "@polkadot-api/utils"
import type { UnstableWallet } from "@substrate/unstable-wallet-provider"
import { getObservableClient } from "./getObservableClient"

const AccountId = (value: SS58String) =>
  Enum<
    {
      type: "Id"
      value: SS58String
    },
    "Id"
  >("Id", value)

export const transferAllowDeathCallData = (
  provider: UnstableWallet.Provider,
  chainId: string,
  destination: SS58String,
  amount: bigint,
) =>
  firstValueFrom(
    getObservableClient(provider, chainId)
      .chainHead$()
      .metadata$.pipe(
        filter(Boolean),
        map((metadata) => {
          const { location, args } = getDynamicBuilder(metadata).buildCall(
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
