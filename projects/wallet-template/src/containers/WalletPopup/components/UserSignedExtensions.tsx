import { type UserSignedExtensions as UserSignedExtensionsTy } from "@polkadot-api/tx-helper"

type Props = {
  userSignedExtensions: Partial<UserSignedExtensionsTy>
}
export const UserSignedExtensions = ({ userSignedExtensions }: Props) => (
  <div>
    {Object.entries(userSignedExtensions).map(([type]) => {
      switch (type) {
        case "CheckMortality": {
          const mortality = userSignedExtensions[type]!
          return (
            <div className="my-1">
              Mortality:{" "}
              {mortality.mortal ? `${mortality.period} blocks` : "inmortal"}
            </div>
          )
        }
        case "ChargeTransactionPayment": {
          const payment = userSignedExtensions[type]!
          return <div className="my-1">tip: {payment.toString()}</div>
        }
        // TODO: improve tip in a different asset
        case "ChargeAssetTxPayment": {
          const payment = userSignedExtensions[type]!
          return <div className="my-1">tip: {payment.tip.toString()}</div>
        }
        default: {
          return null
        }
      }
    })}
  </div>
)
