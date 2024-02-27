export type WebPageRpcSpec = {
  onAddChains(
    chains: Record<string, { genesisHash: string; name: string }>,
  ): void
}
