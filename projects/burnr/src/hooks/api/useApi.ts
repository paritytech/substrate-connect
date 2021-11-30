// SPDX-License-Identifier: Apache-2

import { useContext } from "react"
import { ApiPromise } from "@polkadot/api"

import { ApiContext } from "../../utils/contexts"

const useApi = (): ApiPromise => {
  return useContext<ApiPromise>(ApiContext)
}

export default useApi
