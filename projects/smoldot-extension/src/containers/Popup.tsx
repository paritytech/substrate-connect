import React, { ReactElement } from 'react';
import { createMuiTheme, ThemeProvider, Grid, Input, Button, ButtonGroup } from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import GlobalFonts from '../assets/fonts/fonts';
import { light, PolkaFont, AntSwitch, NodeArea, TabInfo } from '../components';
import { NetworkEnum, isEmpty } from '../utils/utils';

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

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            minWidth: '240px',
            height: '500px',
        },
        margin0: {
            margin: '0'
        },
        marginTop15: {
            margin: '15px 0'
        }
  }),
);

interface NodeProps {
    nodeEnum: NetworkEnum;
    network: object;
}

const NodeRow: React.FC<NodeProps> = ({ nodeEnum, network }): ReactElement => (
    <NodeArea network={nodeEnum}>
        {!isEmpty(network) && (<TabInfo tabs={network} />)}
    </NodeArea>
)

const Popup: React.FunctionComponent = () => {
    const appliedTheme = createMuiTheme(light);
    const classes = useStyles();
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
            <div className={classes.root}>
                <Grid container spacing={0}>
                    <Grid item xs={12}>
                        <h2 className={classes.margin0}>Substrate Connect</h2>
                    </Grid>
                    <Grid item xs={12}>
                        {counter > 0 ?
                            (<div>is connected to {foundNetworks.map(v => (<PolkaFont>{v}</PolkaFont>))}.</div>) :
                            (<h3 className={classes.margin0}>no web3 apps.</h3>)
                        }
                    </Grid>
                    {counter > 0  && (
                        <Grid item xs={12}>
                            <Input fullWidth placeholder="Search by network, uApp or url" />
                        </Grid>
                    )}
                </Grid>
                <Grid
                    container
                    spacing={3}
                    className={classes.marginTop15}>
                    <NodeRow nodeEnum={NetworkEnum.kusama} network={kusama} />
                    <NodeRow nodeEnum={NetworkEnum.polkadot} network={polkadot} />
                    <NodeRow nodeEnum={NetworkEnum.westend} network={westend} />
                    <NodeRow nodeEnum={NetworkEnum.kulupu} network={kulupu} />
                    <Grid container item xs={10}>
                        <Button fullWidth>All Nodes</Button>
                        <Button fullWidth>Url to uApps list</Button>
                        <Button fullWidth>Stop all connections</Button>
                    </Grid>
                </Grid>
            </div>
        </ThemeProvider>
	);
};

export default Popup;
