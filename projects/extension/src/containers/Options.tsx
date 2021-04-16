import * as React from 'react';
import * as material from '@material-ui/core';
import { light, ClientSearch, Logo, ClientItem } from '../components/';
import GlobalFonts from '../fonts/fonts';
import {
  // DEACTIVATE FOR NOW - will be needed once parachains will be integrated
  //  Parachain,
  Network
} from 'src/types';

const { createMuiTheme, ThemeProvider, Box } = material;

const Options: React.FunctionComponent = () => {
	const appliedTheme = createMuiTheme(light);
	const [networks, setNetworks] = React.useState<Network[]>([{} as Network]);

  React.useEffect((): void => {
    const port = chrome.runtime.connect({ name: `substrateExtension` });
    port.onMessage.addListener(( { type, about, payload }): void => {
      if (type === 'error') {
        console.error('Error from port: ', payload);
      } else {
        about === 'networks' && setNetworks(payload);
      }
    });
  }, []);
	
	return (
		<ThemeProvider theme={appliedTheme}>
			<GlobalFonts />
			<Logo />
			<ClientSearch />
			
			<Box mt={4}>
				{networks && networks.map((network: Network, i:number) => 
					<div key={i}>
						<ClientItem {...network} />
						{/*  DEACTIVATE FOR NOW - will be needed once parachains will be integrated
            network.parachains && network.parachains.map((parachain: Parachain, p:number) => 
							<ClientItem key={p} {...parachain}/>
            ) */}
					</div>
				)}
			</Box>
		</ThemeProvider>
	);
};

export default Options;
