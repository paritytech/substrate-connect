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
				<FiberManualRecordIcon style={{ fontSize: '16px' }} color='primary'/>
			</Grid>
			<Grid item xs={12}>

				<Grid container alignItems='center'>
					<Typography variant='h4'>
						{ node.networkName }
					</Typography>
					{ newHead &&
						<PopoverInfo>
							<Typography variant='body2'>
								Current block #
								<Typography variant='subtitle2' component='span'>
									{newHead.number.toString()}
								</Typography>
							</Typography>
						</PopoverInfo>
					}
				</Grid>

				<Typography variant='body2' color='textSecondary'>Node provider: {node.providerName} </Typography>
			</Grid>
		</Grid>
	);
};

export default NodeSelectorSelected;
