// SPDX-License-Identifier: Apache-2
import { useState } from 'react';
import { NetworkCtx, TabInterface } from '../types';

const sampleNetworkCtx: TabInterface[] = [
	{
		tabId: 0,
		url: 'my-awesome-uapp1.com/index.html',
		uApps: [{
			networks: [
				{name: 'rococo', status: 'connected', isKnown: true, chainspecPath:''},
				{name: 'kusama', status: 'connected', isKnown: true, chainspecPath:''},
				{name: 'polkadot', status: 'connected', isKnown: true, chainspecPath:''},
				{name: 'kulupu', status: 'connected', isKnown: true, chainspecPath:''},
			],
			name: 'Current tab uApp',
			enabled: true,
		}]
	},
	{
		tabId: 1,
		url: 'my-awesome-uapp2.com/index.html',
		uApps: [{
			networks: [{name: 'westend', status: 'connected', isKnown: true, chainspecPath:''}],
			name: 'uApp in inactive tab',
			enabled: true
		}]
	},
	{
		tabId: 2,
		url: 'my-awesome-uapp3.com/index.html',
		uApps: [{
			networks: [
				{name: 'kusama', status: 'connected', isKnown: true, chainspecPath:''},
				{name: 'kulupu', status: 'connected', isKnown: true, chainspecPath:''},
			],
			name: 'Disabled uApp',
			enabled: false
		}]
	}
]

export default function useTabs (): TabInterface[] {
  const [tabs] = useState<NetworkCtx>(sampleNetworkCtx);

//   useEffect((): void => {
//     network.forEach(n => {
//         n && n.networkName === net && setNetworkTabs(n.tabs);
//     })
//   }, [network]);

  return tabs;
}
