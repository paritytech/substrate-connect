// SPDX-License-Identifier: Apache-2
import { useEffect, useState } from 'react';
import { logger } from '@polkadot/util';
import useApi from './api/useApi';
import useIsMountedRef from './api/useIsMountedRef';
import { BURNR_WALLET } from '../utils/constants';

export default function useUsers (): string[] {
  const api = useApi();
  const [users, setUsers] = useState<string[]>([]);
  const  mountedRef = useIsMountedRef();

  useEffect((): void => {
    const l = logger(BURNR_WALLET);
    api.query.system.account
      .entries()
      .then((entries): void => {
        mountedRef.current && setUsers(
          entries
            .filter(([, { data: { free } }]) => !free.isZero())
            .map(([key]) => key.args[0].toString())
        )
      })
      .catch(l.error);
  }, [api, mountedRef]);

  return users;
}
