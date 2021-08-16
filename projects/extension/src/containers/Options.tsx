import React, { useEffect } from 'react';
import { createMuiTheme, ThemeProvider } from '@material-ui/core'
import Box from '@material-ui/core/Box'
import Switch from '@material-ui/core/Switch';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import { light, Logo, NetworkTab } from '../components/';
import GlobalFonts from '../fonts/fonts';
import { Background } from '../background/';
import { withStyles, Theme, createStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import {
  // DEACTIVATE FOR NOW - will be n./src/containers/Options.tsx once parachains will be integrated
  //  Parachain,
  Network
} from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface StyledTabProps {
  label: string;
}

const MenuTabs = withStyles({
  root: {
    minHeight: 34
  }
})(Tabs);

const MenuTab = withStyles((theme: Theme) =>
  createStyles({
    root: {
      textTransform: 'none',
      minWidth: 110,
      minHeight: 34,
      marginRight: theme.spacing(3),
      color: '#BDBDBD',
      '&:hover': {
        opacity: 1,
      },
      '&$selected': {
        border: '1px solid #EEEEEE',
        borderRadius: '5px',
        color: '#000',
        backgroundColor: '#F7F7F7'
      },
    },
    selected: {},
  }),
)((props: StyledTabProps) => <Tab disableRipple {...props} />);

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box mt={4}>{children}</Box>
      )}
    </div>
  );
}

const Options: React.FunctionComponent = () => {
  const appliedTheme = createMuiTheme(light);
  const [value, setValue] = React.useState<number>(0);
  const [networks, setNetworks] = React.useState<Network[]>([{} as Network]);
  const [notifications, setNotifications] = React.useState<boolean>(false);

  useEffect((): void => {
    chrome.storage.sync.get(['notifications'], (res) => {
      setNotifications(res.notifications);
    });

    chrome.runtime.getBackgroundPage(backgroundPage => {
      const bg = backgroundPage as Background;
      const nets: Network[] = [];
      // TODO (nik): Temporary solution on react until https://github.com/paritytech/substrate-connect/issues/451 is implemented
      bg.manager.networks.forEach(network => {
        const check = nets.find(n => n.name === network.name)
        if (!check) nets.push(network)
      })
      setNetworks(nets);
    });
  }, []);

  useEffect(() => {
    chrome.storage.sync.set({notifications: notifications}, () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      }
    });
  }, [notifications])

  const handleChange = (event: React.ChangeEvent<unknown>, newValue: number) => {
    setValue(newValue);
  };

  return (
    <ThemeProvider theme={appliedTheme}>
      <GlobalFonts />
      <Logo />
      <MenuTabs
        value={value}
        onChange={handleChange}
        TabIndicatorProps={{
          style: {
              display: "none",
          },
        }}>
        <MenuTab label="Networks">
        </MenuTab>
        <MenuTab label="Settings">
        </MenuTab>
      </MenuTabs>
      
      <TabPanel value={value} index={0}>
        {/*  Deactivate search for now
          <ClientSearch />
        */}
        {networks && networks.map((network: Network, i:number) => 
          <NetworkTab key={i} name={network.name} />
        )}
      </TabPanel>
      <TabPanel value={value} index={1}>
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
      </TabPanel>
    </ThemeProvider>
  );
};

export default Options;
