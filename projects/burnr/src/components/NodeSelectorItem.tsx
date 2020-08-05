import React from 'react';
import { Grid } from '@material-ui/core';
import { NodeInfo } from './types';
import DoneIcon from '@material-ui/icons/Done';

interface Props {
  node: NodeInfo;
  selected: boolean;
};

const NodeSelectorSelected: React.FunctionComponent<Props> = ({ node, selected }: Props) => {

	return (
		<Grid
			container
			alignItems='center'
			wrap='nowrap'
		>
			<Grid item xs={12}>
				{node.providerName}
			</Grid>
			<Grid item>
				{ selected && <DoneIcon/> }
			</Grid>
		</Grid>
	);
};

export default NodeSelectorSelected;
