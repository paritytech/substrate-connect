// SPDX-License-Identifier: Apache-2

import BN from 'bn.js';
import { useEffect, useState } from 'react';
import { formatBalance } from '@polkadot/util';

import useApi from './api/useApi';
import useIsMountedRef from './api/useIsMountedRef';

type State = [string, BN, boolean];

const ZERO = new BN(0);

export default function useBalance (address: string): State {
  const api = useApi();
  const [state, setState] = useState<State>(['0', ZERO, true]);
  const  mountedRef = useIsMountedRef();

  useEffect((): () => void => {
    let unsubscribe: null | (() => void) = null;

    api.query.system
      .account(address, ({ data }): void => {
        mountedRef.current && setState([
          formatBalance(data.free, { decimals: api.registry.chainDecimals, forceUnit: '-', withSi: false }),
          data.free,
          data.free.isZero()
        ]);
      })
      .then((u): void => {
        unsubscribe = u;
      })
      .catch(console.error);

    return (): void => {
      unsubscribe && unsubscribe();
    }
  }, [address, api]);

  return state;
}
