// SPDX-License-Identifier: Apache-2
import { useState } from 'react';
import { Network } from '../types';

const sampleNetworks: Network[] = [
  {
    name: 'Polkadot',
    status: 'connected',
    isKnown: true,
    chainspecPath: '<polkadot.json>'
  },
  {
    name: 'Kusama',
    status: 'connected',
    isKnown: true,
    chainspecPath: '<kusama.json>'
  },
  {
    name: 'Rococo',
    status: 'connected',
    isKnown: true,
    chainspecPath: '<rococo.json>',
    parachains: [
      {
        name: 'Tick',
        relaychain: 'Rococo',
        icon: 'rococo',
        status: 'connected',
        isKnown: true,
        chainspecPath: '<tick.json>',
      },
      {
        name: 'Trick',
        relaychain: 'Rococo',
        icon: 'rococo',
        status: 'connected',
        isKnown: true,
        chainspecPath: '<trick.json>',
      },
      {
        name: 'Track',
        relaychain: 'Rococo',
        icon: 'rococo',
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
