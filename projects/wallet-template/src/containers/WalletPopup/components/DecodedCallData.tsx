import { useDecodedCallData } from "../hooks"

type Props = {
  chainId: string
  callData: string
}

const jsonStringify = (value: any) =>
  JSON.stringify(
    value,
    (_, value) => (typeof value === "bigint" ? value.toString() : value),
    2,
  )

export const DecodedCallData = ({ chainId, callData }: Props) => {
  const { decodedCallData } = useDecodedCallData(chainId, callData)
  if (!decodedCallData) return <div>decoding...</div>
  return (
    <div>
      <div className="text-sm">Pallet: {decodedCallData.pallet.value.name}</div>
      <div className="text-sm">Call: {decodedCallData.call.value.name}</div>
      <div className="text-sm">Args</div>
      <pre>{jsonStringify(decodedCallData?.args.value)}</pre>
    </div>
  )
}
