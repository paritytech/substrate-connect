/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import * as React from 'react';
import * as material from '@material-ui/core';
import GlobalFonts from '../fonts/fonts';
import { light, Tab, MenuButton } from '../components';
import { Background } from '../background/';
import { MsgExchangePopup, TabInterface } from '../types';
import { AppMediator } from '../background/AppMediator';
import { ConnectionManager } from 'background/ConnectionManager';
import { ExtensionAction } from '../types/enums';

const { createMuiTheme, ThemeProvider, Box, Divider } = material;

const Popup: React.FunctionComponent = () => {
  const [activeTab, setActiveTab] = React.useState<React.ReactElement | undefined>();
  const [currentTabId, setCurrentTabId] = React.useState<number | undefined>();
  const [rTabs, setRTabs] = React.useState<React.ReactElement[]>([]);
  const appliedTheme = createMuiTheme(light);
  const [apps, setApps] = React.useState<AppMediator[]>([] as AppMediator[]);
  const [manager, setManager] = React.useState<ConnectionManager>({} as ConnectionManager);
  React.useEffect((): (() => void) => {
    const incomingMsgListener = (req: MsgExchangePopup) => {
      if (req.ext !== 'substrate-connect') {
        return
      }
      switch (req.action) {
        case ExtensionAction.remove:
          setApps(req.apps);
          currentTabId == req.tabId && setActiveTab(undefined);
          window.postMessage('Hello', 'substrate-connect');
          break;
        case ExtensionAction.add:
          setApps(req.apps);
          break;
        default:
      }
    }

    chrome.runtime.getBackgroundPage(backgroundPage => {
      const bg = backgroundPage as Background;
      bg.manager && setManager(bg.manager);
      bg.manager && setApps(bg.manager.apps);
    });

    chrome.runtime.onMessage.addListener(incomingMsgListener);

    return (): void => {
      chrome.runtime.onMessage.removeListener(incomingMsgListener);
    }
  }, [currentTabId]);

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
        if (t.isActive) {
          setActiveTab(<Tab manager={manager} current tab={t} />);
          setCurrentTabId(t.tabId);
        } else {
          restTabs.push(<Tab  manager={manager} key={t.tabId} tab={t}/>);
        }
      })
      setRTabs(restTabs);
    });
  }, [apps, manager]);

  return (
    <ThemeProvider theme={appliedTheme}>
      <Box width={'340px'} mb={0.1}>
        <GlobalFonts />
        {activeTab || <Tab current manager={manager} />}
        <Box marginY={1}>
          {rTabs.map(r => r)}
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
