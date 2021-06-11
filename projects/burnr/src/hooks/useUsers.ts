// SPDX-License-Identifier: Apache-2
import { useEffect, useState } from 'react';
import useApi from './api/useApi';
import useIsMountedRef from './api/useIsMountedRef';

export default function useUsers (): string[] {
  const api = useApi();
  const [users, setUsers] = useState<string[]>([]);
  const  mountedRef = useIsMountedRef();

  useEffect((): void => {
    api.query.system.account
      .entries()
      .then((entries): void => {
        console.log('entries', entries)
        mountedRef.current && setUsers(
          entries
            .filter(([, { data: { free } }]) => !free.isZero())
            .map(([key]) => key.args[0].toString())
        )
      })
      .catch(console.error);
  }, [api, mountedRef]);

  return users;
}
