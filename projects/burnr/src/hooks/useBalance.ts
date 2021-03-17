// SPDX-License-Identifier: Apache-2

import BN from 'bn.js';
import { useEffect, useState } from 'react';
import { formatBalance } from '@polkadot/util';
import { Balance } from '@polkadot/types/interfaces';

import useApi from './api/useApi';
import useIsMountedRef from './api/useIsMountedRef';

type State = [string, Balance, boolean];

const ZERO = new BN(0);

export default function useBalance (address: string): State {
  const api = useApi();
  const [state, setState] = useState<State>([
    '0',
    new BN(ZERO) as Balance,
    true
  ]);
  const  mountedRef = useIsMountedRef();
  useEffect((): () => void => {
    let unsubscribe: null | (() => void) = null;
    api.query.system
      .account(address, ({ data }): void => {
        // console.log('address', address, 'data', formatBalance(data.free, { decimals: api.registry.chainDecimals[0], forceUnit: '-', withSi: false }));
        mountedRef.current && setState([
          formatBalance(data.free, { decimals: api.registry.chainDecimals[0], withSi: false }),
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
  }, [address, api, mountedRef]);

  return state;
}

[{"signature":{"signer":"1jwBXt6A3sTbSKiVeVuTK1RRYPacciE1At7gqE15uj1r1QM","signature":{"Sr25519":"0x1eacfbace19329f57f6ea4f54b5c35ad0c54cb584f4be8e2abf5d3de3847de1d2b121ec67a25a2298fa5d413d99938cdd38d03b5f35a5979eb2573f43b89ae81"},"era":{"MortalEra":"0x1500"},"nonce":3,"tip":2000000000},"method":{"callIndex":"0x0500","args":{"dest":"14mzt1qchfnTB8X2YyQ97tRBYCrV51417brZ6mQi6RPWK5nS","value":1209500000000}}}]
