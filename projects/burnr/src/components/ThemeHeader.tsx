import React from 'react';

import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
	root: {
		position: 'fixed',
		zIndex: -1,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		width: '100vw',
		maxWidth: '1330px',
		padding: theme.spacing(2),
		paddingRight: theme.spacing(1),

		[theme.breakpoints.down('sm')]: {
			paddingTop: theme.spacing(1),
		},
	},
}));

const ThemeHeader: React.FunctionComponent = ({ children }) => {
	const classes = useStyles();
	return (
		<div className={classes.root}>
			{children}
		</div>
	);
};

export default ThemeHeader;
