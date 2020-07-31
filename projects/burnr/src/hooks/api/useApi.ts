// SPDX-License-Identifier: Apache-2

import { useContext } from 'react';
import { ApiPromise } from '@polkadot/api';

import { ApiContext } from '../../utils/contexts';

export default function useApi (): ApiPromise {
  return useContext(ApiContext);
}
