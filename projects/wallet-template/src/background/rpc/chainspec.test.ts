import { describe, test, it, expect } from "vitest"
import { removeChainSpecHandler as removeChainSpec } from "./chainspec"
import { wellKnownChainIdByGenesisHash } from "../../constants"
import { Context } from "./types"
import { mock } from "vitest-mock-extended"
import {
  LightClientPageHelper,
  PageChain,
} from "@substrate/light-client-extension-helpers/extension-page"
import { JsonRpcProvider } from "@polkadot-api/json-rpc-provider"

describe("chainspec rpc", () => {
  const mockContext = mock<Context>()
  const mockLightClientPageHelper = mock<LightClientPageHelper>()
  mockContext.lightClientPageHelper = mockLightClientPageHelper

  describe("remove well know chain fails", () => {
    Object.entries(wellKnownChainIdByGenesisHash).map(
      ([genesisHash, chainId]) =>
        test.fails(`${chainId}`, async () => {
          await removeChainSpec([genesisHash], mockContext)
        }),
    )
  })

  it("should cascade delete parachains when its relay chain is deleted", async () => {
    const relayChainGenesisHash =
      "0x759b9d9f1426b8a53769eb41b390f9f398a27f8165e54929784caf840dac9887"
    const parachainGenesisHash =
      "0x7467ca58bc9757d08c13ceea3b840c770c741e21ece1c6ede3c03be3eccba342"
    const fakeNetwork: PageChain[] = [
      {
        genesisHash: relayChainGenesisHash,
        name: "not-westend",
        ss58Format: 0,
        chainSpec: "{}",
        provider: mock<JsonRpcProvider>(),
        bootNodes: [],
      },
      {
        genesisHash: parachainGenesisHash,
        name: "not-westend-asset-hub",
        ss58Format: 0,
        provider: mock<JsonRpcProvider>(),
        relayChainGenesisHash: relayChainGenesisHash,
        chainSpec: "{}",
        bootNodes: [],
      },
    ]

    mockLightClientPageHelper.getChains.mockResolvedValueOnce(fakeNetwork)

    await removeChainSpec([relayChainGenesisHash], mockContext)

    expect(mockLightClientPageHelper.deleteChain).toHaveBeenCalledWith(
      relayChainGenesisHash,
    )
    expect(mockLightClientPageHelper.deleteChain).toHaveBeenCalledWith(
      parachainGenesisHash,
    )
  })
})
