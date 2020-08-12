import React, { useState } from 'react';
import { ThemeProvider, createMuiTheme, CssBaseline } from '@material-ui/core';
import { SubstrateLight, SubstrateDark } from '../themes';
import { useLocalStorage } from '../hooks';
import { ThemeHeader, LogoSubstrate, ThemeButton } from '.';

const ThemeToggleProvider: React.FunctionComponent = ({ children }) => {
	const [localTheme, setLocalTheme] = useLocalStorage('theme');
	const [theme, setTheme] = useState(localTheme === 'false' ? false : true);

	const selectTheme = (selected) => {
		setLocalTheme(selected);
		setTheme(selected);
	}

	const appliedTheme = createMuiTheme(theme	? SubstrateLight: SubstrateDark);

	return (
		<ThemeProvider theme={appliedTheme}>
			<CssBaseline />
			<ThemeHeader>
				<LogoSubstrate theme={theme} />
				<ThemeButton theme={theme} onClick={() => selectTheme(!theme)} />
			</ThemeHeader>
			{children}
		</ThemeProvider>
	);
};

export default ThemeToggleProvider;
