import React, { ReactElement } from 'react';
import { createMuiTheme, ThemeProvider, Input, Button, Typography, Box } from '@material-ui/core';
import GlobalFonts from '../fonts/fonts';
import { light, IconWeb3, Tab, NodeArea, TabInfo } from '../components';
import { NetworkEnum } from '../utils/enums';
import { isEmpty } from '../utils/utils';
import { useTabs } from '../hooks';
interface NodeProps {
    nodeEnum: NetworkEnum;
}

/*** Keep this in comments for a little while (in case needed) */ 
// const NodeRow: React.FC<NodeProps> = ({ nodeEnum }): ReactElement => {
//     return (
//         <NodeArea network={nodeEnum}>
//             {!isEmpty(nodeEnum) && (
//                 <>
//                     <Typography variant='body1'>uApp title</Typography>
//                     <TabInfo key={nodeEnum} network={nodeEnum} />
//                 </>
//             )}
//         </NodeArea>
//     )
// }

const NetworksFound: React.FC = (): ReactElement => (
    <Box
        pt={1.7} pr={2.4} pb={0.8} pl={2.4}
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

    console.log('tabs', tabs)

    /* this is kinda of how  the access is to chrome tabs */
    // chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, 
    // (tabs) => {
    //     console.log('tabs', tabs, tabs[0].url)
    // });

	return (
        <ThemeProvider theme={appliedTheme}>
            <Box width={'304px'}>
                <GlobalFonts />
                <Tab current tab={tabs[0]}/>
                <NetworksFound />
                <Tab tab={tabs[1]}/>
                {/* Keep these in comments for a little while (in case needed)
                <NodeRow nodeEnum={NetworkEnum.kusama} />
                <NodeRow nodeEnum={NetworkEnum.polkadot} />
                <NodeRow nodeEnum={NetworkEnum.westend} />
                <NodeRow nodeEnum={NetworkEnum.kulupu} />
                */}
                
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
