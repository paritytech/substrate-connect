import React, { useEffect } from 'react';
import { createMuiTheme, ThemeProvider } from '@material-ui/core'
import Box from '@material-ui/core/Box'
import Switch from '@material-ui/core/Switch';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import { light, Logo, ClientItem } from '../components/';
import GlobalFonts from '../fonts/fonts';
import { Background } from '../background/';
import {
  // DEACTIVATE FOR NOW - will be needed once parachains will be integrated
  //  Parachain,
  Network
} from '../types';

const Options: React.FunctionComponent = () => {
  const appliedTheme = createMuiTheme(light);
  const [networks, setNetworks] = React.useState<Network[]>([{} as Network]);
  const [notifications, setNotifications] = React.useState<boolean>(false);

  useEffect((): void => {
    chrome.storage.sync.get(['notifications'], (res) => {
      setNotifications(res.notifications);
    });

    chrome.runtime.getBackgroundPage(backgroundPage => {
      const bg = backgroundPage as Background;
      setNetworks(bg.manager.networks);
    });
  }, []);

  useEffect(() => {
    chrome.storage.sync.set({notifications: notifications});
  }, [notifications])

  return (
    <ThemeProvider theme={appliedTheme}>
      <GlobalFonts />
      <Logo />
      {/*  Deactivate search for now
        <ClientSearch />
      */}
      <FormControl component="fieldset">
        <FormGroup aria-label="position" row>
          <FormControlLabel
            value="Notifications:"
            control={
              <Switch
                checked={notifications}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotifications(e.target.checked)}
                color="primary"
                name="checkedB"
                inputProps={{ 'aria-label': 'primary checkbox' }}
              />
            }
            label="Notifications:"
            labelPlacement="start"
          />
        </FormGroup>
      </FormControl>      
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
