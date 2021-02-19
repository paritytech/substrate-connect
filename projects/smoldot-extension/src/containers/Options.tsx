import React from 'react';
import { createMuiTheme, ThemeProvider, Typography, Box } from '@material-ui/core';
import { light, ClientSearch, Logo, ClientItem } from '../components/';
import GlobalFonts from '../fonts/fonts';

const ClientTypeTitle: React.FunctionComponent = ({children}) => (
	<Box mt={5} mb={2}>
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
			<ClientTypeTitle>Local chainspecs</ClientTypeTitle>
			<ClientItem />
			<ClientTypeTitle>Chainspecs from uApps</ClientTypeTitle>
			<ClientItem isKnown={false}/>
		</ThemeProvider>
	);
};

export default Options;
