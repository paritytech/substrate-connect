import React, { useState } from 'react';
import { ThemeProvider, createMuiTheme, CssBaseline, makeStyles } from '@material-ui/core';
import { SubstrateLight, SubstrateDark } from '../themes';
import { LogoSubstrate, ThemeButton } from '.';

const useStyles = makeStyles(theme => ({
	root: {
		position: 'fixed',
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

const ThemeToggleProvider: React.FunctionComponent = ({ children }) => {
	const classes = useStyles();
	const [theme, setTheme] = useState(true);
	const appliedTheme = createMuiTheme(theme ? SubstrateLight : SubstrateDark);

	return (
		<ThemeProvider theme={appliedTheme}>
			<CssBaseline />
			<div className={classes.root}>
				<LogoSubstrate theme={theme} />
				<ThemeButton theme={theme} onClick={() => setTheme(!theme)} />
			</div>
			{children}
		</ThemeProvider>
	);
};

export default ThemeToggleProvider;
