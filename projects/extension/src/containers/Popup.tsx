/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import * as React from 'react';
import * as material from '@material-ui/core';
import GlobalFonts from '../fonts/fonts';
import { light, MenuButton, Tab } from '../components';
import { Background } from '../background/';
import { debug } from '../utils/debug';
import { TabInterface } from '../types';
import { State, AppInfo } from '../background/types';
import { ConnectionManager } from 'background/ConnectionManager';

const { createMuiTheme, ThemeProvider, Box, Divider } = material;

const createTab = (a: AppInfo, url: string | undefined): TabInterface => {
  return {
    tabId: a.tabId,
    url: url,
    uApp: {
      networks: a.networks.map(b => b.name),
      name: a.name,
      enabled: true
    }
  };
}

const Popup: React.FunctionComponent = () => {
  const [activeTab, setActiveTab] = React.useState<TabInterface | undefined>();
  const [apps, setApps] = React.useState<TabInterface[]>([]);
  const appliedTheme = createMuiTheme(light);
  const [manager, setManager] = React.useState<ConnectionManager | undefined>();
  const [browserTabs, setBrowserTabs] = React.useState<chrome.tabs.Tab[]>();
  const [appsInitState, setAppsInitState] = React.useState<State>();

  // We gather all needed information (from manager[apps] and browserTabs)
  React.useEffect((): void => {
    // retrieve all information from background page and assign to local state
    chrome.runtime.getBackgroundPage(backgroundPage => {
      const bg = backgroundPage as Background;
      if (bg.manager) {
        setManager(bg.manager);
        setAppsInitState(bg.manager.getState());
      }
    });
    
    chrome.tabs.query({"currentWindow": true, }, tabs => {
      // retrieve open tabs assign to local state
      setBrowserTabs(tabs);
    })
  }, []);

  // Fix TabInterface based on init retrieved state and browser tabs 
  React.useEffect(() => {
    const ti: TabInterface[] = [] as TabInterface[];
    /* Iterate through the tabs in order to identify uApps and set them with all info needed
    ** in local state. In addition identify which App is active for showing them in respectful
    ** position in the extension
    */ 
    browserTabs?.forEach((t: chrome.tabs.Tab) => {
      appsInitState?.apps.find(a => {
        if (t.id === a.tabId) {
          if (t.active) {
            setActiveTab(createTab(a, t.url));
          } else {
            ti.push(createTab(a, t.url));
          }
        }
      });
    });
    setApps(ti);
}, [appsInitState, browserTabs]);

React.useEffect(() => {
  // Initialiaze the stateChanged listener in order to act accordingly.
  // Update the extension Tabs based on the incoming state (manager.getState)
  manager?.on('stateChanged', state => {
    console.log('state Changed', state);
    debug('CONNECTION MANAGER APP STATE CHANGED');
    const incTabs: TabInterface[] = [];
    apps.find(a => {
      const result = state.apps.find(b => b.tabId === a.tabId);
      if(result) {
        incTabs?.push(createTab(result, a.url));
      }
    });
    const active = incTabs.find(c => activeTab?.tabId && activeTab.tabId === c.tabId);
    if (!active) {
      setActiveTab(undefined);
    }
    setApps(incTabs);
  });
}, [manager, apps, activeTab]);

  return (
    <ThemeProvider theme={appliedTheme}>
      <Box width={'340px'} mb={0.1}>
        <GlobalFonts />
        {activeTab ? <Tab manager={manager} current tab={activeTab} /> : <Tab manager={manager} current />}
        <Box marginY={1}>
          {apps.map(t => <Tab manager={manager} key={t.tabId} tab={t}/>)}
        </Box>
        <Divider />
        <MenuButton fullWidth onClick={() => chrome.runtime.openOptionsPage()}>My Networks</MenuButton>
        <MenuButton fullWidth>About</MenuButton>
        <Divider />
        <MenuButton fullWidth className='danger'>Stop all connections</MenuButton>
      </Box>
    </ThemeProvider>
  );
};

export default Popup;
