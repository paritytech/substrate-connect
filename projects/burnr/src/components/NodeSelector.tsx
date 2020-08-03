import React from 'react';

import { Typography } from '@material-ui/core';

import { PopoverInfo } from '.';
import { useChainInfo } from '../hooks';

const NodeSelector: React.FunctionComponent = () => {
	const newHead = useChainInfo();

	return  (
		<>
			<Typography variant='h4'>
				Network Name

				{
					newHead &&
					<PopoverInfo>
						<Typography variant='body2'>
							Current block # 
							<Typography variant='subtitle2' component='span'>
								{newHead.number.toString()}
							</Typography>
						</Typography>
					</PopoverInfo>
				}
			</Typography>

			<Typography variant='body2'>Node Provider</Typography>
		</>
	);
};

export default NodeSelector;
