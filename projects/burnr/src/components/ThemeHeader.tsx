import React from 'react';

import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
	root: {
		alignItems: 'center',
		display: 'flex',
		justifyContent: 'space-between',
		maxWidth: '1330px',
		paddingLeft: theme.spacing(2),
		position: 'fixed',
		width: '100vw',
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