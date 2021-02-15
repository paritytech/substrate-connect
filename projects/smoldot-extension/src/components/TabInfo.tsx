import React, { FunctionComponent } from 'react';
import { Grid, Typography } from '@material-ui/core';
import { AntSwitch } from './';

interface Props {
    size?: 'small' | 'medium';
    tabs?: object;
}

// TDODO: data structure. Will we ever need map here at all?
// each uApp will be associated with one url
// if the same uApp, or uApp with the same title will be opened in >1 tab, it's ok to duplicate it on the UI too

const TabInfo: FunctionComponent<Props> = ({ size = 'small', tabs = {} }) => (
    <>
        <Typography variant='body1'>uApp title</Typography>
        {Object.entries(tabs).map((v, k) => (

            <Grid justify='space-between' container key={k + '0_' + v[0]}>
                <Typography
                    variant='body2'
                    color={v[1] ? 'textPrimary' : 'textSecondary'}
                >
                    {v[0]}
                </Typography>
                <AntSwitch size={size} isActive={v[1]}/>
            </Grid>

        ))}
    </>
)

export default TabInfo;
