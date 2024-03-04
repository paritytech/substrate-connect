import {
  UserSignedExtensionName,
  UserSignedExtensions,
} from "@polkadot-api/tx-helper"
import { useEffect, useReducer } from "react"

const reducer = (
  state: Partial<UserSignedExtensions>,
  [name, value]: [
    UserSignedExtensionName,
    UserSignedExtensions[UserSignedExtensionName],
  ],
) => ({
  ...state,
  [name]: value,
})

type Props = {
  userSignedExtensionNames: UserSignedExtensionName[]
  onChange(userSignedExtensions: Partial<UserSignedExtensions>): void
}
export const UserSignedExtensionInputs = ({
  userSignedExtensionNames,
  onChange,
}: Props) => {
  const [state, dispatch] = useReducer(
    reducer,
    {} as Partial<UserSignedExtensions>,
  )
  useEffect(() => onChange(state), [state])
  return (
    <div>
      {userSignedExtensionNames.map((type) => {
        switch (type) {
          case "CheckMortality": {
            return (
              <MortalityInput
                key={type}
                onChange={(v) => dispatch(["CheckMortality", v])}
              />
            )
          }
          case "ChargeTransactionPayment": {
            return (
              <TipInput
                key={type}
                onChange={(v) => dispatch(["ChargeTransactionPayment", v])}
              />
            )
          }
          // TODO: improve tip in a different asset
          case "ChargeAssetTxPayment": {
            return (
              <TipInput
                key={type}
                onChange={(v) => dispatch(["ChargeAssetTxPayment", { tip: v }])}
              />
            )
          }
          default: {
            return null
          }
        }
      })}
    </div>
  )
}

type TipInputProps = {
  onChange(value: UserSignedExtensions["ChargeTransactionPayment"]): void
  defaultValue?: number
}
const TipInput = ({ onChange, defaultValue = 0 }: TipInputProps) => {
  // @ts-expect-error TODO: improve bigint types
  useEffect(() => onChange(defaultValue), [])
  return (
    <div className="my-1">
      <div className="mb-1">Tip</div>
      <div>
        <input
          type="number"
          defaultValue={Number(defaultValue)}
          // @ts-expect-error TODO: improve bigint types
          onChange={(e) => onChange(+e.target.value)}
          min={0}
          className="w-full py-2 px-3 border rounded leading-tigh"
        />
      </div>
    </div>
  )
}

// TODO: the max mortality value could be computed from the metadata
const VALID_MORTALITIES = Array(10)
  .fill(0)
  .map((_, i) => "" + Math.pow(2, i + 2))
VALID_MORTALITIES.unshift("Inmortal")

type MortalityInputProps = {
  onChange(value: UserSignedExtensions["CheckMortality"]): void
  defaultValue?: UserSignedExtensions["CheckMortality"]
}
const MortalityInput = ({
  onChange,
  defaultValue = { mortal: true, period: 64 },
}: MortalityInputProps) => {
  useEffect(() => onChange(defaultValue), [])
  return (
    <div className="my-1">
      <div className="mb-1">Mortality</div>
      <div>
        <select
          defaultValue={defaultValue.mortal ? defaultValue.period : 64}
          onChange={(e) =>
            onChange(
              e.target.value === "Inmortal"
                ? { mortal: false }
                : { mortal: true, period: +e.target.value },
            )
          }
          className="w-full py-2 px-3 border rounded leading-tigh"
        >
          {VALID_MORTALITIES.map((m) => (
            <option value={m}>{m}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
