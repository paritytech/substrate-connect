// SPDX-License-Identifier: Apache-2
import BN from 'bn.js';
import { useEffect, useState } from 'react';
import { logger } from '@polkadot/util';

import useApi from './api/useApi';
import useIsMountedRef from './api/useIsMountedRef';
import { UserInfo } from '../utils/types';
import { BURNR_WALLET } from '../utils/constants';

export default function useUserInfo (address: string): UserInfo {
  const l = logger(BURNR_WALLET);
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
        .catch(l.error);

    return (): void => {
      unsubscribe && unsubscribe();
    }
  }, [address, api, l.error, mountedRef]);

  return usersInfo as UserInfo;
}
