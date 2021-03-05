// SPDX-License-Identifier: Apache-2
import { useState } from 'react';
import { Network } from '../types';

const sampleNetworks: Network[] = [
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
    parachains: [
      {
        name: 'tick',
        status: 'connected',
        isKnown: true,
        chainspecPath: '<tick.json>',
      },
      {
        name: 'trick',
        status: 'connected',
        isKnown: true,
        chainspecPath: '<trick.json>',
      },
      {
        name: 'track',
        status: 'connected',
        isKnown: true,
        chainspecPath: '<track.json>',
      }
    ]
  },
  {
    name: '<Unknown network>',
    status: 'connected',
    isKnown: false,
    chainspecPath: '<url>'
  },
]

export default function useNetworks (): Network[] {
  const [networks] = useState(sampleNetworks);
  return networks;
}
