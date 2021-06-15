// SPDX-License-Identifier: Apache-2

import BN from 'bn.js';
import { useEffect, useState } from 'react';
import { formatBalance, logger } from '@polkadot/util';
import { Balance } from '@polkadot/types/interfaces';

import { BURNR_WALLET } from '../utils/constants';
import useApi from './api/useApi';
import useIsMountedRef from './api/useIsMountedRef';

type State = [string, Balance, boolean, string];

const ZERO = new BN(0);
export default function useBalance (address: string): State {
  const api = useApi();
  const [state, setState] = useState<State>([
    '0',
    new BN(ZERO) as Balance,
    true,
    '-'
  ]);
  const  mountedRef = useIsMountedRef();
  useEffect((): () => void => {
    const l = logger(BURNR_WALLET);
    let unsubscribe: null | (() => void) = null;
    address && api.query.system
      .account(address, ({ data }): void => {
        mountedRef.current && setState([
          formatBalance(data.free, { decimals: api.registry.chainDecimals[0], forceUnit: '-', withSi: false }),
          data.free,
          data.free.isZero(),
          data.free.registry.chainTokens[0]
        ]);
      })
      .then((u): void => {
        unsubscribe = u;
      })
      .catch(l.error);

    return (): void => {
      unsubscribe && unsubscribe();
    }
  }, [address, api, mountedRef]);

  return state;
}
