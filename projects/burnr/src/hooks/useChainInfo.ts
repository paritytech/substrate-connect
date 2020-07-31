// SPDX-License-Identifier: Apache-2

import { useEffect, useState } from 'react';
import { Header } from '@polkadot/types/interfaces';

import useApi from './api/useApi';
import useIsMountedRef from './api/useIsMountedRef';

export default function useChainInfo (): Header {
  const api = useApi();
  const [newHead, setNewHead] = useState<Header>();
  const  mountedRef = useIsMountedRef();

  useEffect((): void => {
    const count = 0;
    api.rpc.chain
      .subscribeNewHeads((header) => {
      mountedRef.current && setNewHead(
        header
      )  
    })

  }, []);

  return newHead;
}
