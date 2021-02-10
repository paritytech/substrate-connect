import React, { useState } from 'react';
import { createMuiTheme, ThemeProvider, Grid, Input } from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import GlobalFonts from '../assets/fonts/fonts';
import { light, PolkaFont, AntSwitch, NodeArea } from '../components';
import { NetworkEnum } from '../utils/utils';

  const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
        width: '240px',
        margin: '10px'
    },
  }),
);

const Popup: React.FunctionComponent = () => {
    const appliedTheme = createMuiTheme(light);
    const classes = useStyles();

    let currentURL;

    /* this is kinda of how  the access is to chrome tabs */
    // chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT}, 
    // (tabs) => {
    //     console.log('tabs', tabs, tabs[0].url)
    // });

	return (
        <ThemeProvider theme={appliedTheme}>
            <GlobalFonts />
            <div className={classes.root}>
                <Grid
                    container
                    style={{ margin: '15px 0'}}>
                        <h2 style={{ margin: '0' }}>Substrate Connect</h2>
                        <h3 style={{ margin: '0' }}>no web3 apps</h3>
                        <Input fullWidth placeholder="Search by network, uApp or url" />
                </Grid>
                <NodeArea network={NetworkEnum.kusama}>
                    <div>123123142341232</div>
                    <div>123123142341232</div>
                    <div>123123142341232</div>
                </NodeArea>
                <NodeArea network={NetworkEnum.polkadot}>
                    <div>123123142341232</div>
                    <div>123123142341232</div>
                    <div>123123142341232</div>
                </NodeArea>
                <NodeArea network={NetworkEnum.westend}>
                    <div>123123142341232</div>
                    <div>123123142341232</div>
                    <div>123123142341232</div>
                </NodeArea>
                <NodeArea network={NetworkEnum.kulupu}>
                    <div>123123142341232</div>
                    <div>123123142341232</div>
                    <div>123123142341232</div>
                </NodeArea>
                <Grid item xs={12}>
                    <div>is connected to <PolkaFont>polkadot</PolkaFont> and <PolkaFont>kusama</PolkaFont></div>
                    <AntSwitch size='s'/>
                </Grid>
                <Grid item xs={12}>
                    <div  style={{
                        height: '300px'
                    }}>Popup Main page alallalal polkadot kusama</div>
                    <PolkaFont size={'60'}>polkadot kusama</PolkaFont>
                </Grid>
            </div>
        </ThemeProvider>
	);
};

export default Popup;
