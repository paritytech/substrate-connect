import * as React from 'react';
import * as material from '@material-ui/core';
import { light, ClientSearch, Logo, ClientItem } from '../components/';
import GlobalFonts from '../fonts/fonts';
import { Background } from '../background/';
import {
  // DEACTIVATE FOR NOW - will be needed once parachains will be integrated
  //  Parachain,
  Network
} from '../types';

const { createMuiTheme, ThemeProvider, Box } = material;

const Options: React.FunctionComponent = () => {
  const appliedTheme = createMuiTheme(light);
  const [networks, setNetworks] = React.useState<Network[]>([{} as Network]);

  React.useEffect((): void => {
    chrome.runtime.getBackgroundPage(backgroundPage => {
      const bg = backgroundPage as Background;
      setNetworks(bg.manager.networks);
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
