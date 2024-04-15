export type HintedSignedExtensions = Partial<{
  tip: bigint
  mortality: { mortal: false } | { mortal: true; period: number }
  asset: Uint8Array
}>
