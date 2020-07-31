import React from 'react';

import { Typography } from '@material-ui/core';

import { PopoverInfo } from '.';

import { useChainInfo } from '../hooks';

const NodeSelector: React.FunctionComponent = () => {
	const blockhash = useChainInfo();

	return  (
		<>
			<Typography variant='h4'>
				Network Name

				<PopoverInfo>
					<Typography variant='body1'>
						Current Block Hash
						<Typography variant='subtitle2'>
							{blockhash}
						</Typography>
					</Typography>
				</PopoverInfo>
			</Typography>

			<Typography variant='body2'>Node Provider</Typography>
		</>
	);
};

export default NodeSelector;
