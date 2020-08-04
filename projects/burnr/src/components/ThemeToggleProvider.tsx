import React, { useState } from 'react';
import { ThemeProvider, createMuiTheme, CssBaseline } from '@material-ui/core';
import { SubstrateLight, SubstrateDark } from '../themes';
import { ThemeHeader, LogoSubstrate, ThemeButton } from '.';

const ThemeToggleProvider: React.FunctionComponent = ({ children }) => {
	const [theme, setTheme] = useState(true);
	const appliedTheme = createMuiTheme(theme ? SubstrateLight : SubstrateDark);

	return (
		<ThemeProvider theme={appliedTheme}>
			<CssBaseline />
			<ThemeHeader>
				<LogoSubstrate theme={theme} />
				<ThemeButton theme={theme} onClick={() => setTheme(!theme)} />
			</ThemeHeader>
			{children}
		</ThemeProvider>
	);
};

export default ThemeToggleProvider;
