import React from 'react';

import { Typography, Grid } from '@material-ui/core';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';

import { PopoverInfo } from '../components';
import { useApi, useChainInfo } from '../hooks';
import { LazyProvider } from '../utils/types'; 

interface Props {
  provider: LazyProvider;
};

const NodeSelectorSelected: React.FunctionComponent<Props> = ({ provider }: Props) => {
	const api = useApi();
	const color = api && api.isReady ? 'primary' : 'error';

	return (
		<Grid
			container
			spacing={1}
			alignItems='center'
			wrap='nowrap'
		>
			<Grid item>
				<FiberManualRecordIcon style={{ fontSize: '16px' }} color={color} />
			</Grid>
			<Grid item xs={12}>

				<Typography variant='h4'>
					{ provider.network }
				</Typography>

				<Grid container>
					<Grid item>
						<Typography variant='body2' color='textSecondary'>{provider.client} client</Typography>
					</Grid>
				</Grid>
			</Grid>
		</Grid>
	);
};

export default NodeSelectorSelected;
