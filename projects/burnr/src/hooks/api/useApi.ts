import { useContext } from "react"
import { ApiPromise } from "@polkadot/api"

import { ApiContext } from "../../utils/contexts"

export const useApi = (): ApiPromise => {
  return useContext<ApiPromise>(ApiContext)
}
