import React from 'react';
import { Box, createMuiTheme, ThemeProvider, Typography } from '@material-ui/core';
import { light, IconWeb3, ClientSearch, Logo } from '../components/';
import GlobalFonts from '../fonts/fonts';

const ClientTypeTitle: React.FunctionComponent = ({children}) => (
	<Box marginY={4}>
		<Typography variant='overline'>
			{children}
		</Typography>
	</Box>
)

const Options: React.FunctionComponent = () => {
	const appliedTheme = createMuiTheme(light);
	
	return (
		<ThemeProvider theme={appliedTheme}>
			<GlobalFonts />
			<Logo />
			<ClientSearch />
			<ClientTypeTitle children='Local chainspecs'/>
			<ClientTypeTitle children='Chainspecs from uApps'/>
			<IconWeb3>polkadot kusama</IconWeb3>
			<div>Options Main page</div>
		</ThemeProvider>
	);
};

export default Options;
