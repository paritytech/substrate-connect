import React from 'react';
import { Grid } from '@material-ui/core';
import DoneIcon from '@material-ui/icons/Done';

import { Option } from './NodeSelector';

interface Props {
  provider: Option;
  selected: boolean;
}

const NodeSelectorSelected: React.FunctionComponent<Props> = ({ provider, selected }: Props) => {

	const visibility = selected ? 'visible' : 'hidden';

	return (
		<Grid
			container
			alignItems='center'
			wrap='nowrap'
		>
			<Grid item>
				<DoneIcon style={{ fontSize:'16px', visibility: visibility, transform: 'translateX(-4px)'}} />
			</Grid>
			<Grid item xs={12}>
				{provider.client} client
			</Grid>
		</Grid>
	);
};

export default NodeSelectorSelected;
