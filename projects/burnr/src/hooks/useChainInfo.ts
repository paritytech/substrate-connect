// SPDX-License-Identifier: Apache-2

import { useEffect, useState } from 'react';
import { Header } from '@polkadot/types/interfaces';

import useApi from './api/useApi';
import useIsMountedRef from './api/useIsMountedRef';

export default function useChainInfo (): Header | undefined {
  const api = useApi();
  const [newHead, setNewHead] = useState<Header>();
  const  mountedRef = useIsMountedRef();

  useEffect((): void => {
    api.rpc.chain
      .subscribeNewHeads((lastHeader): void => {
      mountedRef.current && setNewHead(lastHeader)  
    }).catch(err => console.log('There was an error', err));

  }, [api.rpc.chain, mountedRef]);
  return newHead;
}
