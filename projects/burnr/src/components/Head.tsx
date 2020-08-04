import React from 'react';

import { Paper, Box, Grid, makeStyles, Theme } from '@material-ui/core';
import { NodeSelector, LogoApp } from '.';

const useStyles = makeStyles((theme: Theme) => ({
	root: {
		[theme.breakpoints.down('sm')]: {
			paddingTop: theme.spacing(7),
		},
	},
}));

const Head: React.FunctionComponent = () => {
	const classes = useStyles();

	return (
		<Grid container alignItems='center' className={classes.root}>
			<Grid item xs={6}>
				<Box paddingX={2}>
					<LogoApp/>
				</Box>
			</Grid>
			<Grid item xs={6}>
				<Paper>
					<Box paddingX={2}>
						<NodeSelector/>
					</Box>
				</Paper>
			</Grid>
		</Grid>
	);
};

export default Head;
