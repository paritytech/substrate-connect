import React from 'react';
import { createMuiTheme, ThemeProvider, Typography, Box } from '@material-ui/core';
import { light, ClientSearch, Logo, ClientItem } from '../components/';
import GlobalFonts from '../fonts/fonts';

const ClientTypeTitle: React.FunctionComponent = ({children}) => (
	<Box marginY={4}>
		<Typography variant='overline'>
			{children}
		</Typography>
	</Box>
);

const Options: React.FunctionComponent = () => {
	const appliedTheme = createMuiTheme(light);
	
	return (
		<ThemeProvider theme={appliedTheme}>
			<GlobalFonts />
			<Logo />
			<ClientSearch />
			<ClientTypeTitle children='Local chainspecs'/>
			<ClientItem />
			<ClientTypeTitle children='Chainspecs from uApps'/>
			<ClientItem isKnown={false}/>
		</ThemeProvider>
	);
};

export default Options;
