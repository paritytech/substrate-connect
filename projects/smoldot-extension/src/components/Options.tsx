import React from 'react';
import { createMuiTheme, ThemeProvider } from '@material-ui/core';
import light from './theme';

const Options: React.FunctionComponent = () => {
	const appliedTheme = createMuiTheme(light);
	
	return (
		<ThemeProvider theme={appliedTheme}>
			<div>Options Main page</div>
		</ThemeProvider>
	);
};

export default Options;
