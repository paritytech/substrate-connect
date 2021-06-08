/* TODO(nik): Fix smoldot definition (see: https://github.com/paritytech/substrate-connect/blob/3350cdff9c4c294393160189816168a93c983f79/projects/extension/src/background/ConnectionManager.ts#L202)
** eslints disable below seems to be due to smoldot definition */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import React, { FunctionComponent, useEffect, useState } from 'react';
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

const Popup: FunctionComponent = () => {
  const [activeTab, setActiveTab] = useState<TabInterface | undefined>();
  const [apps, setApps] = useState<TabInterface[]>([]);
  const appliedTheme = createMuiTheme(light);
  const [manager, setManager] = useState<ConnectionManager | undefined>();
  const [browserTabs, setBrowserTabs] = useState<chrome.tabs.Tab[]>();
  const [appsInitState, setAppsInitState] = useState<State>();

  // We gather all needed information (from manager[apps] and browserTabs)
  useEffect((): void => {
    // retrieve all information from background page and assign to local state
    chrome.runtime.getBackgroundPage(backgroundPage => {
      const bg = backgroundPage as Background;
      if (bg.manager) {
        setManager(bg.manager);
        setAppsInitState(bg.manager.getState());
      }
    });
    // retrieve open tabs and assign to local state
    chrome.tabs.query({"currentWindow": true, }, tabs => {
      setBrowserTabs(tabs);
    })
  }, []);

  useEffect((): void => {
    /**
     * Iterates through the tabs in order to identify uApps and set them with all info needed
     * in local state. In addition identify which App is active for showing them in respectful
     * position in the extension
     * @param browserTabs - The tabs that are open when extension popup windows open (set on previous useEffect)
     * @param appState - The apps that are retrieved from background through getState() 
    **/ 
    const setExtensionApps = (
      browserTabs: chrome.tabs.Tab[] | undefined,
      appState: State | undefined
      ) => {
      const ti: TabInterface[] = [] as TabInterface[];
      browserTabs?.forEach((t: chrome.tabs.Tab) => {
        appState?.apps.find(a => {
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
    }

    setExtensionApps(browserTabs, appsInitState);

    manager?.on('stateChanged', state => {
      debug('CONNECTION MANAGER APP STATE CHANGED');
      setExtensionApps(browserTabs, state);
    });
}, [appsInitState, browserTabs, manager]);

  /**
   * If "Stop all connections" button is pressed then disconnectAll 
   * function will be called to disconnect all apps.
  **/ 
  const onDisconnectAll = (): void => {
    /* TODO(nik): Fix smoldot definition (see: https://github.com/paritytech/substrate-connect/blob/3350cdff9c4c294393160189816168a93c983f79/projects/extension/src/background/ConnectionManager.ts#L202)
    ** eslint disable below seems to be due to smoldot definition */ 
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    manager?.disconnectAll();
  }

  const goToOptions = (): void => {
    chrome.runtime.openOptionsPage();
  }

  return (
    <ThemeProvider theme={appliedTheme}>
      <Box width={'340px'} mb={0.1}>
        <GlobalFonts />
        {activeTab ? <Tab manager={manager} current tab={activeTab} setActiveTab={setActiveTab} /> : <Tab manager={manager} current />}
        <Box marginY={1}>
          {apps.map(t => <Tab manager={manager} key={t.tabId} tab={t}/>)}
        </Box>
        <Divider />
        <MenuButton fullWidth onClick={goToOptions}>My Networks</MenuButton>
        <MenuButton fullWidth>About</MenuButton>
        <Divider />
        <MenuButton fullWidth className='danger' onClick={onDisconnectAll}>Stop all connections</MenuButton>
      </Box>
    </ThemeProvider>
  );
};

export default Popup;
