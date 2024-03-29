import { rpc } from "../../api"

export const fetchKeysets = async () => {
  const keysets = await rpc.client.listKeysets()
  const selectedKeyset = keysets[keysets.length - 1]
  if (!selectedKeyset) return

  return [selectedKeyset, keysets] as const
}
