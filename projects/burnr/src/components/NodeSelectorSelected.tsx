import React from 'react';

import { Typography, Grid } from '@material-ui/core';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';

import { PopoverInfo } from '.';
import { useChainInfo } from '../hooks';
import { LazyProvider } from '../utils/types'; 

interface Props {
  provider: LazyProvider;
};

const NodeSelectorSelected: React.FunctionComponent<Props> = ({ provider }: Props) => {
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

				<Typography variant='h4'>
					{ provider.network }
				</Typography>

				<Grid container>
					<Grid item>
						<Typography variant='body2' color='textSecondary'>{provider.client} client</Typography>
					</Grid>
					{ newHead &&
					<Grid item>
						<PopoverInfo>
							<Typography variant='body2'>
									Current block #
								<Typography variant='subtitle2' component='span'>
									{newHead.number.toString()}
								</Typography>
							</Typography>
						</PopoverInfo>
					</Grid>
					}
				</Grid>
			</Grid>
		</Grid>
	);
};

export default NodeSelectorSelected;
