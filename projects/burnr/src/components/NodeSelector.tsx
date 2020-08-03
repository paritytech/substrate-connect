import React from 'react';

import { Typography } from '@material-ui/core';

import { PopoverInfo } from '.';

const NodeSelector: React.FunctionComponent = () => {
	return  (
		<>
			<Typography variant='h4'>
				Network Name

				<PopoverInfo>
					<Typography variant='body1'>
						Chain Info:
						<Typography variant='subtitle2'>
							chain info
						</Typography>
					</Typography>
				</PopoverInfo>
			</Typography>

			<Typography variant='body2'>Node Provider</Typography>
		</>
	);
};

export default NodeSelector;
