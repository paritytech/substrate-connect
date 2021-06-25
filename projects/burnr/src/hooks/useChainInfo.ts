import { useEffect, useState } from 'react';
import { Header } from '@polkadot/types/interfaces';
import { logger } from '@polkadot/util';

import { BURNR_WALLET } from '../utils/constants';
import useApi from './api/useApi';
import useIsMountedRef from './api/useIsMountedRef';

export default function useChainInfo (): Header | undefined {
  const l = logger(BURNR_WALLET);
  const api = useApi();
  const [newHead, setNewHead] = useState<Header>();
  const  mountedRef = useIsMountedRef();

  useEffect((): void => {
    api.rpc.chain
      .subscribeNewHeads((lastHeader): void => {
      mountedRef.current && setNewHead(lastHeader)  
    }).catch(err => l.error('There was an error', err));

  }, [api.rpc.chain, l, mountedRef]);
  return newHead;
}
