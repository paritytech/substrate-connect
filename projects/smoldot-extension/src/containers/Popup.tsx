import React, { ReactElement } from 'react';
import { createMuiTheme, ThemeProvider, Input, Button, Typography, Box } from '@material-ui/core';
import GlobalFonts from '../assets/fonts/fonts';
import { light, IconWeb3, NodeArea, TabInfo } from '../components';
import { NetworkEnum } from '../utils/enums';
import { isEmpty } from '../utils/utils';

// MOCK DATA for filed tabs
const tabs = {
    kusama: {
        "url.net/kusama": true,
        "url.net/kusama2": false,
        "url.net/kusama3": true,
    },
    polkadot: {
        "url.net/polkadot": true,
        "url.net/polkadot2": false,
        "url.net/polkadot3": false,
        "url.net/polkadot4": true,
    },
    westend: {},
    kulupu: {
        "url.net/kulupu": false
    }
}

// MOCK DATA for empty tabs
// const tabs = {
//     kusama: {},
//     polkadot: {},
//     westend: {},
//     kulupu: {}
// }
interface NodeProps {
    nodeEnum: NetworkEnum;
    network: object;
}

const NodeRow: React.FC<NodeProps> = ({ nodeEnum, network }): ReactElement => (
    <NodeArea network={nodeEnum}>
        {!isEmpty(network) && (<TabInfo key={nodeEnum} tabs={network} />)}
    </NodeArea>
)

const Popup: React.FunctionComponent = () => {
    const appliedTheme = createMuiTheme(light);
    /* this is kinda of how  the access is to chrome tabs */
    // chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, 
    // (tabs) => {
    //     console.log('tabs', tabs, tabs[0].url)
    // });

    // DEMO TABS - will arrive from chrome tabs
    const { kusama, polkadot, westend, kulupu } = tabs;

    let counter = 0;
    const foundNetworks: string[] = [];

    Object.entries(tabs).map((v, k) => {
        if (!isEmpty(v[1])) {
            counter++;
            foundNetworks.push(v[0]);
        }
    })

	return (
        <ThemeProvider theme={appliedTheme}>
            <GlobalFonts />

            <Typography variant='h3'>Substrate Connect</Typography>
            <Typography variant='body1'>
            {counter 
                ? <>is connected to {foundNetworks.map(v => (<IconWeb3 key={v}>{v}</IconWeb3>))}</>
                : `no web3 apps`
            }
            </Typography>
            {counter &&
                <Box mt={1} mb={2}>
                    <Input fullWidth placeholder="Search by network, uApp or url" />
                </Box>
            }
            
            <NodeRow nodeEnum={NetworkEnum.kusama} network={kusama} />
            <NodeRow nodeEnum={NetworkEnum.polkadot} network={polkadot} />
            <NodeRow nodeEnum={NetworkEnum.westend} network={westend} />
            <NodeRow nodeEnum={NetworkEnum.kulupu} network={kulupu} />
            
            <Box mt={1}>
                <Button fullWidth>All Nodes</Button>
                <Button fullWidth>Url to uApps list</Button>
                <Button fullWidth>Stop all connections</Button>
            </Box>
        </ThemeProvider>
	);
};

export default Popup;
