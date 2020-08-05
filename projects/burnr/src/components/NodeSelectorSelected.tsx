import React from 'react';

import { Typography, Grid } from '@material-ui/core';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';

import { PopoverInfo } from '.';
import { useChainInfo } from '../hooks';
import { NodeInfo } from './types';

interface Props {
  node: NodeInfo;
};

const NodeSelectorSelected: React.FunctionComponent<Props> = ({ node }: Props) => {
	const newHead = useChainInfo();

	return (
		<Grid
			container
			spacing={1}
			alignItems='center'
			wrap='nowrap'
		>
			<Grid item>
				<FiberManualRecordIcon fontSize="small" color='primary'/>
			</Grid>
			<Grid item xs={12}>
				<Typography variant='h4'>
					{ node.networkName }
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
				<Typography variant='body2' color='textSecondary'>Node provider: {node.providerName} </Typography>
			</Grid>
		</Grid>
	);
};

export default NodeSelectorSelected;
