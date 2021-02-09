import React from 'react';
import { createMuiTheme, ThemeProvider } from '@material-ui/core';
import light from './theme';
import { Logo } from '.';

const Options: React.FunctionComponent = () => {
	const appliedTheme = createMuiTheme(light);
	
	return (
		<ThemeProvider theme={appliedTheme}>
			<Logo />
			<div>Options Main page</div>
		</ThemeProvider>
	);
};

export default Options;
