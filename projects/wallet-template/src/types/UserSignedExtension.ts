export type UserSignedExtensions = {
  CheckMortality?:
    | {
        mortal: false
      }
    | {
        mortal: true
        period: number
      }
  ChargeTransactionPayment: bigint
  ChargeAssetTxPayment: {
    tip: bigint
    asset?: Uint8Array
  }
}

export type UserSignedExtensionName = keyof UserSignedExtensions
