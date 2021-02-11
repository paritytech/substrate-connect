import React from 'react';
import { createMuiTheme, ThemeProvider } from '@material-ui/core';
import { light, PolkaFont } from '../components/';
import GlobalFonts from '../assets/fonts/fonts';
import { Logo } from '.';

const Options: React.FunctionComponent = () => {
	const appliedTheme = createMuiTheme(light);
	
	return (
		<ThemeProvider theme={appliedTheme}>
        	<GlobalFonts />
			<Logo />
			<PolkaFont>polkadot kusama</PolkaFont>
			<div>Options Main page</div>
		</ThemeProvider>
	);
};

export default Options;
