import React, { FunctionComponent } from 'react';
import { Grid, Typography } from '@material-ui/core';
import { Switch } from './';
import { useTabs } from '../hooks';
import { TabInterface } from '../types';

interface Props {
    size?: 'small' | 'medium';
}

// TDODO: data structure. Will we ever need map here at all?
// each uApp will be associated with one url
// if the same uApp, or uApp with the same title will be opened in >1 tab, it's ok to duplicate it on the UI too

const TabInfo: FunctionComponent<Props> = ({ size = 'small' }) => {
    const tabs = useTabs();
    return (
        <>
        {tabs.map((t:TabInterface) => (
            <Grid justify='space-between' container key={t.tabId}>
                <Typography
                    variant='body2'
                    color={'textPrimary'}
                >
                    {t.tabId}
                </Typography>
                <Switch size={size} isActive={!!t.tabId}/>
            </Grid>
        ))}
        </>
    )
}

export default TabInfo;
