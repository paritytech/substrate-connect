import React, { useState } from 'react';

import { FormControl, Select, Typography } from '@material-ui/core';

import { PopoverInfo } from '.';
import { endpoints, ALL_PROVIDERS } from './../constants';
import { useChainInfo, useLocalStorage } from '../hooks';

const NodeSelector: React.FunctionComponent = () => {
	const [localEndpoint, setLocalEndpoint] = useLocalStorage('endpoint');
	const [endpoint, setEndpoint] = useState<string | null>(localEndpoint || endpoints.polkadot);

	const handleChange = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
		const selectedEndpoint = event.target.value as string;
		setEndpoint(selectedEndpoint)
		setLocalEndpoint(selectedEndpoint);
		
		// setChain(REMOTE_PROVIDERS[selectedEndpoint].network);
		console.log("Burnr wallet is now connected to", ALL_PROVIDERS[selectedEndpoint].endpoint)
  };

	return  (
		<>
			<FormControl>
        <Select
          value={endpoint}
          onChange={handleChange}
          inputProps={{
            name: 'endpoint',
            id: 'select-endpoint',
          }}
        >
					{
						Object.entries(ALL_PROVIDERS).map(([provider, settings]) => (
							<option key={provider} value={provider}>
								{settings.network} {settings.source}
							</option>
						))
					}
        </Select>
      </FormControl>
		</>
  );
}
