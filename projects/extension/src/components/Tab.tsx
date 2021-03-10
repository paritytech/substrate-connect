import React, { FunctionComponent } from 'react';
import { Grid, Typography, Box } from '@material-ui/core';
import { blue, grey } from '@material-ui/core/colors';
import { Switch, IconWeb3 } from '../components';
import { TabInterface } from '../types';

interface TabProps {
  current?: boolean;
  tab?: TabInterface;
}

// TDODO: data structure. Will we ever need map here at all?
// each uApp will be associated with one url
// if the same uApp, or uApp with the same title will be opened in >1 tab, it's ok to duplicate it on the UI too
const Tab: FunctionComponent<TabProps> = ({ tab, current=false }) => (
  <Box 
    pt={current ? 2 : 1}
    pb={current ? 2 : 1}
    pr={current ? 1.5 : 3}
    pl={3}
  >
    <Grid
      container
      justify='space-between'
      alignItems='center'
      wrap='nowrap'
    >
      <Grid item>
        <Typography noWrap variant={current ? 'h3' : 'h4'}>
          {tab?.uApps[0].name}
        </Typography>
      </Grid>
      <Grid item>
        <Grid
          container
          alignItems='center'
          wrap='nowrap'
          spacing={1}
        >
          {tab?.uApps[0].networks.map(network =>
          <Grid item>
            <IconWeb3 
              key={network.name}
              size='14px'
              color={tab?.uApps[0].enabled ? grey[800] : grey[400]}
              children={network.name}
            />
          </Grid>
          )}
          <Grid item>
            <Switch size={current ? 'medium' : 'small'} isActive={tab?.uApps[0].enabled} />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
    {!current &&
      <Typography variant='body2' style={{color: blue[200]}}>
        {tab?.url}
      </Typography>
    }
  </Box>
);

export default Tab;
