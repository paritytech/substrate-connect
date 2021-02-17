import React from 'react';
import { createMuiTheme, ThemeProvider } from '@material-ui/core';
import { light, IconWeb3, ClientSearch, Logo } from '../components/';
import GlobalFonts from '../fonts/fonts';

const Options: React.FunctionComponent = () => {
	const appliedTheme = createMuiTheme(light);
	
	return (
		<ThemeProvider theme={appliedTheme}>
			<GlobalFonts />
			<Logo />
			<ClientSearch />
			<IconWeb3>polkadot kusama</IconWeb3>
			<div>Options Main page</div>
		</ThemeProvider>
	);
};

export default Options;
