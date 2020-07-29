// SPDX-License-Identifier: Apache-2

import { useEffect, useState } from 'react';
import useApi from './useApi';
import useIsMountedRef from './useIsMountedRef';

export default function useChainInfo (): string {
  const api = useApi();
  const [blockHash, setBlockHash] = useState<string>();
  const  mountedRef = useIsMountedRef();

  useEffect((): void => {
    api.rpc.chain
      .getBlockHash()
      .then((hash): void => {
        console.log('Current Block', hash.toString())
        mountedRef.current && setBlockHash(
          hash.toString()
        )
      })
      .catch(console.error);
  }, []);

  return blockHash;
}
