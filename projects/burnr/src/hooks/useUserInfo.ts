// SPDX-License-Identifier: Apache-2
import BN from 'bn.js';
import { useEffect, useState } from 'react';
import type { AccountInfo, Balance } from '@polkadot/types/interfaces';

import useApi from './api/useApi';
import useIsMountedRef from './api/useIsMountedRef';
import { UserInfo } from '../utils/types';

export default function useUserInfo (address: string): UserInfo {
  const api = useApi();
  const  mountedRef = useIsMountedRef();
  const [usersInfo, setUsersInfo] = useState<any>([]);

  useEffect((): () => void => {
    let unsubscribe: null | (() => void) = null;

    api.query.system
        .account(address, ( data ): void => {
          mountedRef.current && setUsersInfo({
              active: !(data).refcount?.isZero(),
              address: address,
              created: new Date(),
              balance: new BN((data).data.free),
              reserved: new BN((data).data.reserved),
              feeFrozen: new BN((data).data.feeFrozen),
              miscFrozen: new BN((data).data.feeFrozen)
            });
        })
        .then((u: any): void => {
          unsubscribe = u;
        })
        .catch(console.error);

    return (): void => {
      unsubscribe && unsubscribe();
    }
  }, [address, api]);

  return usersInfo as any;
}