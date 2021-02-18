import React from 'react';
import { makeStyles, Grid, InputBase, Divider, ButtonBase } from '@material-ui/core';
import { grey } from '@material-ui/core/colors';
import { SystemUpdateAlt } from '@material-ui/icons';

const useStyles = makeStyles(theme => ({
	root: {
		backgroundColor: grey[100],
		borderRadius: theme.spacing(0.5),
		border: `1px solid ${grey[200]}`,
	},
	inputRoot: {
		'& input': {
			padding: theme.spacing(1),
		},
	},
	buttonRoot: {
		borderTopRightRadius: theme.spacing(0.5),
		borderBottomRightRadius: theme.spacing(0.5),
		backgroundColor: theme.palette.background.default,
		paddingLeft: theme.spacing(1.2),
		paddingRight: theme.spacing(1.2),
	},
}));

const ClientSearch: React.FunctionComponent = () => {
	const classes = useStyles();

	return (
    <Grid
			container
			wrap='nowrap'
			className={classes.root}
		>
      <InputBase
				fullWidth
				placeholder='Search by network, uApp or url'
				className={classes.inputRoot}
			/>
			<Divider orientation='vertical' flexItem/>
      <ButtonBase className={classes.buttonRoot}>
        <SystemUpdateAlt fontSize='small' />
      </ButtonBase>
    </Grid>
	);
};

export default ClientSearch;
