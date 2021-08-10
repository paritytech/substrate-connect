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
import { withStyles, Theme, createStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

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

  const handleChange = (event: React.ChangeEvent<unknown>, newValue: number) => {
    setValue(newValue);
  };

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
        <ClientSearch />
        {networks && networks.map((network: Network, i:number) => 
          <div key={i}>
            <ClientItem {...network} />
            {/*  DEACTIVATE FOR NOW - will be needed once parachains will be integrated
            network.parachains && network.parachains.map((parachain: Parachain, p:number) => 
              <ClientItem key={p} {...parachain}/>
            ) */}
          </div>
        )}
      </TabPanel>
      <TabPanel value={value} index={1}>
        Settings
      </TabPanel>
    </ThemeProvider>
  );
};

export default Options;
