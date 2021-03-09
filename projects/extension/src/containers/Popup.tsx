import * as React from 'react';
import * as material from '@material-ui/core';
import GlobalFonts from '../fonts/fonts';
import { light, Tab } from '../components';
import { useTabs } from '../hooks';

const { createMuiTheme, ThemeProvider, Input, Button, Box } = material;

const SearchBar: React.FC = (): React.ReactElement => (
    <Box
        paddingY={1} paddingX={3}
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

	return (
        <ThemeProvider theme={appliedTheme}>
            <Box width={'304px'}>
                <GlobalFonts />
                <Tab current tab={tabs[0]}/>
                <SearchBar />
                <Tab tab={tabs[1]}/>                
                <Box mt={1}>
                    <Button fullWidth>All Nodes</Button>
                    <Button fullWidth>Url to uApps list</Button>
                    <Button fullWidth>Stop all connections</Button>
                </Box>
            </Box>
        </ThemeProvider>
	);
};

export default Popup;
