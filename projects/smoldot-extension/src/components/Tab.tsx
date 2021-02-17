import React, { FunctionComponent, useEffect, useState } from 'react';
import {
    Grid,
    Typography,
    Box,
    Accordion,
    AccordionSummary,
    AccordionDetails } from '@material-ui/core';
import { Switch } from '.';
import { TabInterface, uApp, Networks } from '../utils/types';
import { IconWeb3 } from '../components';
import { useTabs } from '../hooks';

interface TabProps {
    size?: 'small' | 'medium';
    current?: boolean;
    tab?: TabInterface;
}

// TDODO: data structure. Will we ever need map here at all?
// each uApp will be associated with one url
// if the same uApp, or uApp with the same title will be opened in >1 tab, it's ok to duplicate it on the UI too
const Tab: FunctionComponent<TabProps> = ({ tab, current=false, size = 'small' }) => {
    const [apps, setApps] = useState<uApp[] | null>(null);

    useEffect(():void => {
        console.log('tab', tab)
        // need to collect all uApps name and add in a title to show on Title
        tab && setApps(tab.uApps);
    },[tab])

    return (
        <Box mt={1.6} mr={2.4} mb={0.55} ml={2.4}>
            {!current && (
                <Grid container xs={12}>
                    {tab?.url}
                </Grid>
            )}
            <Grid
                container
                justify='space-between'
                alignItems='center'
                wrap='nowrap'
                spacing={0}
                style={{ marginBottom: '15px'}}>
                <Grid item xs={current ? 10 : 11} zeroMinWidth>
                    <Typography
                        noWrap
                        variant={current ? 'h3' : 'body1'}
                        color={'textPrimary'}
                    >
                    uApps in TabuApps in Tab uApps in Tab #{tab?.tabId}
                    </Typography>
                </Grid>
                <Grid item xs={current ? 2 : 1} container justify='flex-end'>
                    <Switch size={current ? 'medium' : 'small'} isActive={true} />
                </Grid>
            </Grid>
            { // This mapping is fine as soon as we will be receiving information concerning all TAB and not only specific uApp
                apps && apps.map((a:uApp) => {
                    let nets: string[] = [];
                    a.networks.forEach((n:Networks) => nets.push(n.name));
                    return (
                        <Grid
                            container
                            justify='space-between'
                            alignItems='center'
                            wrap='nowrap'
                            spacing={0}
                            key={a.name}
                            style={{ padding: '5.5px 0'}}>
                            <Grid item zeroMinWidth xs={8}>
                                <Typography
                                    noWrap
                                    variant='body2'
                                    color='textPrimary'>
                                        {a.name}
                                </Typography>
                            </Grid>
                            <Grid item container justify='flex-end' xs={3}>
                                {nets.map(v => {
                                    // Based on status of network this should alter
                                    return (<IconWeb3 key={v}>{v}</IconWeb3>)
                                })}
                            </Grid>
                            <Grid item container justify='flex-end' xs={1}>
                                <Switch size={size} isActive={true}/>
                            </Grid>
                        </Grid>
                    )
                })
            }
        </Box>
    );
}

export default Tab;