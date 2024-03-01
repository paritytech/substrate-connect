import type {
  ComplexDecoded,
  Decoded,
  PrimitiveDecoded,
} from "@polkadot-api/metadata-builders"
import { toHex } from "@polkadot-api/utils"
import { useDecodedCallData } from "../hooks"

const jsonStringify = (value: any) =>
  JSON.stringify(
    value,
    (_, value) => (typeof value === "bigint" ? value.toString() : value),
    2,
  )

type Props = {
  chainId: string
  callData: string
}
export const DecodedCallData = ({ chainId, callData }: Props) => {
  const { decodedCallData } = useDecodedCallData(chainId, callData)
  if (!decodedCallData) return <div>decoding...</div>
  return (
    <div>
      <div className="text-xs font-semibold">Pallet Call</div>
      <div className="px-2">
        {decodedCallData.pallet.value.name} {decodedCallData.call.value.name}
      </div>
      <div className="text-xs font-semibold">Args</div>
      <DecodedValue value={decodedCallData.args.value} />
    </div>
  )
}

type DecodedValueProps = {
  value: Decoded
}
const DecodedValue = ({ value }: DecodedValueProps) => (
  <div className="px-2">
    {isPrimitiveDecoded(value) ? (
      <DecodedPrimitiveValue value={value} />
    ) : (
      <DecodedComplexValue value={value} />
    )}
  </div>
)

type DecodedPrimitiveProps = {
  value: PrimitiveDecoded
}
const DecodedPrimitiveValue = ({ value }: DecodedPrimitiveProps) => {
  switch (value.codec) {
    case "_void": {
      return <div>void</div>
    }
    case "bool":
    case "char":
    case "str":
    case "Bytes":
    case "BytesArray": {
      return <div>{value.value}</div>
    }
    case "AccountId": {
      return <div>{value.value.address}</div>
    }
    case "bitSequence": {
      // FIXME: improve bitsequence UI
      // for example: n1,n2,...,n
      return (
        <div>
          BitSequence: {toHex(value.value.bytes)}({value.value.bitsLen})
        </div>
      )
    }
    case "compactBn":
    case "compactNumber":
    case "i128":
    case "i16":
    case "i256":
    case "i32":
    case "i64":
    case "i8":
    case "u128":
    case "u16":
    case "u256":
    case "u32":
    case "u64":
    case "u8":

    default:
      return <div>{value.value.toString()}</div>
  }
}

type DecodedComplexProps = {
  value: ComplexDecoded
}
const DecodedComplexValue = ({ value }: DecodedComplexProps) => {
  switch (value.codec) {
    case "Tuple":
    case "Sequence":
    case "Array": {
      return value.value.map((value) => <DecodedValue value={value} />)
    }
    case "Enum": {
      return (
        <>
          <div className="text-xs">{value.value.type}</div>
          <DecodedValue value={value.value.value} />
        </>
      )
    }
    case "Option": {
      // FIXME: What Option variant is value (Some or None)?
      return value.value.codec === "_void" ? (
        <div>None</div>
      ) : (
        <DecodedValue value={value.value} />
      )
    }
    case "Result": {
      // FIXME: What Result variant is value (Ok or Error)?
      return (
        <>
          <div className="text-xs">Ok</div>
          <DecodedValue value={value.value.ok} />
          <div className="text-xs">Error</div>
          <DecodedValue value={value.value.ko} />
        </>
      )
    }
    case "Struct": {
      return Object.entries(value.value).map(([key, value]) => (
        <>
          <div className="text-xs">{key}</div>
          <DecodedValue value={value} />
        </>
      ))
    }
    default:
      return <pre className="text-xs">{jsonStringify(value)}</pre>
  }
}

const PRIMITIVE_CODECS: PrimitiveDecoded["codec"][] = [
  "bool",
  "char",
  "str",
  "u8",
  "u16",
  "u32",
  "u64",
  "u128",
  "u256",
  "i8",
  "i16",
  "i32",
  "i64",
  "i128",
  "i256",
  "bitSequence",
  "_void",
  "compactNumber",
  "compactBn",
  "Bytes",
  "BytesArray",
  "AccountId",
]
const isPrimitiveDecoded = (value: Decoded): value is PrimitiveDecoded =>
  PRIMITIVE_CODECS.includes(value.codec as PrimitiveDecoded["codec"])
