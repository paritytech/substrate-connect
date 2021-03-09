import * as React from 'react';
import * as material from '@material-ui/core';
import { light, ClientSearch, Logo, ClientItem } from '../components/';
import GlobalFonts from '../fonts/fonts';
import { useNetworks } from '../hooks';
import { Network, Parachain } from 'src/types';

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
				{networks.map((network: Network, i:number) => 
					<div key={i}>
						<ClientItem {...network} />
						{network.parachains && network.parachains.map((parachain: Parachain, p:number) => 
							<ClientItem key={p} {...parachain}/>
						)}
					</div>
				)}
			</Box>
		</ThemeProvider>
	);
};

export default Options;
