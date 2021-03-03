// SPDX-License-Identifier: Apache-2
import { useState } from 'react';
import { Networks } from '../types';

const sampleNetworks: Networks[] = [
  {
    name: 'polkadot',
    status: 'connected',
    isKnown: true,
    chainspecPath: '<polkadot.json>'
	},
  {
    name: 'kusama',
    status: 'connected',
    isKnown: true,
    chainspecPath: '<kusama.json>'
  },
  {
    name: 'rococo',
    status: 'connected',
    isKnown: true,
    chainspecPath: '<rococo.json>',
    // parachains: [
    //   {
    //     name: 'tick',
    //     status: 'connected',
    //     isKnown: true,
    //     chainspecPath: '<path.json>',
    //   },
    //   {
    //     name: 'trick',
    //     status: 'connected',
    //     isKnown: true,
    //     chainspecPath: '<path.json>',
    //   },
    //   {
    //     name: 'track',
    //     status: 'connected',
    //     isKnown: true,
    //     chainspecPath: '<path.json>',
    //   }
    // ]
  },
  {
    name: '<Unknown network>',
    status: 'connected',
    isKnown: false,
    chainspecPath: '<url>'
  },
]

export default function useNetworks (): Networks[] {
  const [networks] = useState(sampleNetworks);
  return networks;
}
