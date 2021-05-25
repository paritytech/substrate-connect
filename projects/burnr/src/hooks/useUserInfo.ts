// SPDX-License-Identifier: Apache-2
import BN from 'bn.js';
import { useEffect, useState } from 'react';

import useApi from './api/useApi';
import useIsMountedRef from './api/useIsMountedRef';
import { UserInfo } from '../utils/types';

export default function useUserInfo (address: string): UserInfo {
  const api = useApi();
  const  mountedRef = useIsMountedRef();
  const [usersInfo, setUsersInfo] = useState<unknown>([]);

  useEffect((): () => void => {
    let unsubscribe: null | (() => void) = null;

    api.query.system
        .account(address, ( data ): void => {
          mountedRef.current && setUsersInfo({
              address: address,
              created: new Date(),
              balance: new BN((data).data.free),
              reserved: new BN((data).data.reserved),
              feeFrozen: new BN((data).data.feeFrozen),
              miscFrozen: new BN((data).data.feeFrozen)
            });
        })
        .then((u: null | (() => void)): void => {
          unsubscribe = u;
        })
        .catch(console.error);

    return (): void => {
      unsubscribe && unsubscribe();
    }
  }, [address, api, mountedRef]);

  return usersInfo as UserInfo;
}
