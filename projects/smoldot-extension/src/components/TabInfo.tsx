import React, { FunctionComponent } from 'react';
import { Grid } from '@material-ui/core';
import { AntSwitch } from './';

interface Props {
    size?: string;
    tabs?: object;
}

const TabInfo: FunctionComponent<Props> = ({ size = 's', tabs = {} }) => (
    <Grid container justify="flex-start" spacing={1}>
        <Grid item xs={12}>
            <h4 style={{ margin: '0'}}>uApp title</h4>
        </Grid>
        <Grid container item justify="flex-start" spacing={1}>
            {Object.entries(tabs).map((v, k) => (
                <Grid container key={k + '0_' + v[0]}>
                    <Grid key={k + '1_' + v[0]} item xs={10}>
                        {v[0]} - {v[1] ? 'active' : 'inactive'}
                    </Grid>
                    <Grid key={k + '2_' + v[0]} item xs={1}>
                        <AntSwitch size={size} isActive={v[1]}/>
                    </Grid>
                </Grid>
            ))}
        </Grid>
    </Grid>
)

export default TabInfo;
