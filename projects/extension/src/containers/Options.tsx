import * as React from 'react';
import * as material from '@material-ui/core';
import { light, ClientSearch, Logo, ClientItem } from '../components/';
import GlobalFonts from '../fonts/fonts';
import { useNetworks } from '../hooks';
import { Networks } from 'src/types';

const { createMuiTheme, ThemeProvider, Box } = material;

const Options: React.FunctionComponent = () => {
	const appliedTheme = createMuiTheme(light);
	const networks = useNetworks();
	
	return (
		<ThemeProvider theme={appliedTheme}>
			<GlobalFonts />
			<Logo />
			<ClientSearch />
			<Box mt={4}>
				{networks.map((network: Networks, i:number) => <ClientItem {...network} key={i} />)}
			</Box>
		</ThemeProvider>
	);
};

export default Options;
