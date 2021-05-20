/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import * as React from 'react';
import * as material from '@material-ui/core';
import GlobalFonts from '../fonts/fonts';
import { light, Tab, MenuButton, MenuInputText } from '../components';
import { CallMade as Save } from '@material-ui/icons';
import { Background } from '../background/';
import { debug } from '../utils/debug';
import { TabInterface } from '../types';
import { AppMediator } from '../background/AppMediator';

const { createMuiTheme, ThemeProvider, Box, Divider } = material;

const SearchBar: React.FC = (): React.ReactElement => (
  <Box
    paddingY={1}
    paddingX={3}
    style={{ background: '#FCFCFC'}}
    borderTop={'1px solid #EEEEEE'}
    borderBottom={'1px solid #EEEEEE'}
  >
    <MenuInputText fullWidth placeholder="search by network, uApp or url" />
  </Box>
);

const Popup: React.FunctionComponent = () => {
  const [activeTab, setActiveTab] = React.useState<React.ReactElement | undefined>();
  const [rTabs, setRTabs] = React.useState<React.ReactElement[]>([]);
  const appliedTheme = createMuiTheme(light);
  const [apps, setApps] = React.useState<AppMediator[]>([]);

  React.useEffect((): void => {
    chrome.runtime.getBackgroundPage(backgroundPage => {
      const bg = backgroundPage as Background;
      bg.manager && setApps(bg.manager.apps);

      // TODO: change the state when stateChanged occurs
      bg.manager.on('stateChanged', () => {
        debug('CONNECTION MANAGER STATE CHANGED', bg.manager.getState());
      });
    });
  }, []);

  React.useEffect((): void => {
    const gatherTabs: TabInterface[] = [];
    const restTabs: React.ReactElement[] = [];
    chrome.tabs.query({"currentWindow": true, }, tabs => {
      tabs.forEach(t => {
        // TODO: This could be migrated to backend - so that no transformation is needed in Popup
        apps.find(({ tabId, smoldotName, appName, }) => {
          if (tabId === t.id) {
            gatherTabs.push({
              isActive: t.active,
              tabId: t.id,
              url: t.url,
              uApp: {
                networks: [smoldotName],
                name: appName,
                enabled: true
              }
            })
          }
        })
      });
      gatherTabs.forEach(t => {
        (t.isActive) ? setActiveTab(<Tab current tab={t} />) : restTabs.push(<Tab key={t.tabId} tab={t}/>);
      })
      setRTabs(restTabs);
    });
  }, [apps]);

  return (
    <ThemeProvider theme={appliedTheme}>
      <Box width={'340px'} mb={0.1}>
        <GlobalFonts />
        {activeTab}
        <SearchBar />
        <Box marginY={1}>
          {rTabs.map(r => r)}
        </Box>
        <Divider />
        <MenuButton fullWidth onClick={() => chrome.runtime.openOptionsPage()}>My Networks</MenuButton>
        <MenuButton fullWidth endIcon={<Save />}>Url to uApps list</MenuButton>
        <Divider />
        <MenuButton className='danger' fullWidth>Stop all connections</MenuButton>
      </Box>
    </ThemeProvider>
  );
};

export default Popup;
