// SPDX-License-Identifier: Apache-2
import { useState } from 'react';
import { NetworkCtx, TabInterface } from '../types';

const sampleNetworkCtx: TabInterface[] = [{
	tabId: 0,
	url: 'my-awesome-uapp1.com/index.html',
	uApps: [{
		networks: [
			{name: 'westend', status: 'connected'},
			{name: 'kusama', status: 'connected'},
			{name: 'polkadot', status: 'connected'},
			{name: 'kulupu', status: 'connected'},
		],
		name: 'First uApp First uApp First uApp First uApp',
		enabled: true,
	},
	{
		networks: [{name: 'kusama', status: 'disconnected'}],
		name: 'Second uApp',
		enabled: false
	},
	{
		networks: [{name: 'polkadot', status: 'connected'}],
		name: 'Third uApp',
		enabled: true
	}]   
	},
	{
	tabId: 1,
	url: 'my-awesome-uapp2.com/index.html',
	uApps: [{
		networks: [{name: 'westend', status: 'disconnected'}],
		name: 'uApp2',
		enabled: true
	},
	{
		networks: [{name: 'westend', status: 'connected'}],
		name: 'uApp3',
		enabled: false
	}
	]    
	},
	{
	tabId: 2,
	url: 'my-awesome-uapp3.com/index.html',
	uApps: [{
		networks: [{name: 'westend', status: 'connected'}],
		name: 'uApp4',
		enabled: true
	}]
	}]

export default function useTabs (): TabInterface[] {
  const [tabs] = useState<NetworkCtx>(sampleNetworkCtx);

//   useEffect((): void => {
//     network.forEach(n => {
//         n && n.networkName === net && setNetworkTabs(n.tabs);
//     })
//   }, [network]);

  return tabs;
}