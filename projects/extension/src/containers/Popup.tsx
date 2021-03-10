import * as React from 'react';
import * as material from '@material-ui/core';
import GlobalFonts from '../fonts/fonts';
import { light, Tab } from '../components';
import { useTabs } from '../hooks';
import { Save } from '@material-ui/icons';

const { createMuiTheme, ThemeProvider, Input, Button, Box, Divider } = material;

const SearchBar: React.FC = (): React.ReactElement => (
    <Box
        paddingY={1}
        paddingX={3}
        style={{ background: '#FCFCFC'}}
        borderTop={'1px solid #EEEEEE'}
        borderBottom={'1px solid #EEEEEE'}
    >
        <Input fullWidth placeholder="search by network, uApp or url" />
    </Box>
);

const Popup: React.FunctionComponent = () => {
    const appliedTheme = createMuiTheme(light);
    const tabs = useTabs();
    /* this is kinda of how  the access is to chrome tabs */
    chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, 
    (tabs) => {
        console.log('tabs', tabs, tabs[0].url)
    });
    const tabCurrent = tabs[0];
    const tabsRest = tabs.slice(1);

	return (
        <ThemeProvider theme={appliedTheme}>
            <Box width={'340px'} mb={1}>
                <GlobalFonts />
                <Tab current tab={tabCurrent}/>
                <SearchBar />
                <Box marginY={1}>
                    {tabsRest.map(tab => <Tab tab={tab}/>)}
                </Box>
                <Divider />
                <Button fullWidth>All Nodes</Button>
                <Button fullWidth endIcon={<Save />}>Url to uApps list</Button>
                <Divider />
                <Button fullWidth>Stop all connections</Button>
            </Box>
        </ThemeProvider>
	);
};

export default Popup;
