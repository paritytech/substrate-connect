import React from 'react';
import { Grid } from '@material-ui/core';
import { NodeInfo } from './types';
import DoneIcon from '@material-ui/icons/Done';

interface Props {
  node: NodeInfo;
  selected: boolean;
};

const NodeSelectorSelected: React.FunctionComponent<Props> = ({ node, selected }: Props) => {

	const visibility = selected ? 'visible' : 'hidden';

	return (
		<Grid
			container
			alignItems='center'
			wrap='nowrap'
		>
			<Grid item>
				<DoneIcon style={{ fontSize:'16px', visibility: visibility, transform: 'translateX(-4px)' }} />
			</Grid>
			<Grid item xs={12}>
				{node.providerName}
			</Grid>
		</Grid>
	);
};

export default NodeSelectorSelected;
