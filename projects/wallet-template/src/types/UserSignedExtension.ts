export type SignedExtension = {
  value: Uint8Array
  additionalSigned: Uint8Array
}

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
    tip: number | bigint
    asset?: Uint8Array
  }
}

export type UserSignedExtensionName = keyof UserSignedExtensions
