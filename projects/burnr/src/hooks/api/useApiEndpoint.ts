// SPDX-License-Identifier: Apache-2

import { useEffect, useState } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';

import useIsMountedRef from './useIsMountedRef';

export default function useProvider (): string | null {
  const [endpoint, setEndpoint] = useState<string | null>(null);
  const  mountedRef = useIsMountedRef();

  useEffect((): void => {
    if(endpoint){
      console.log('YES endpoint', endpoint)
    } else {
      console.log("NO endpoint")
    }

  }, []);

  return endpoint;
}
