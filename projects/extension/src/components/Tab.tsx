import React, { FunctionComponent } from 'react';
import { Grid, Typography, Box, IconButton, createStyles, makeStyles } from '@material-ui/core';
import { grey } from '@material-ui/core/colors';
import CloseIcon from '@material-ui/icons/Close';
import { IconWeb3 } from '../components';
import { TabInterface } from '../types';

interface TabProps {
  current?: boolean;
  tab?: TabInterface;
}

const useStyles = makeStyles(() =>
  createStyles({
    disableButton: {
      color: grey[800],
      '&:not(:hover)': {
        opacity: 0.1,
      },
      '& svg': {
        fontSize: '0.8rem',
      }
    }
  })
);

const ButtonDisableTab: FunctionComponent = () => {
  const classes = useStyles();
  return (
    <IconButton size='small' className={classes.disableButton}>
      <CloseIcon />
    </IconButton>
  );
}

const Tab: FunctionComponent<TabProps> = ({ tab, current=false }) => (
  <Box 
    pt={current ? 2 : 1}
    pb={current ? 2 : 1}
    pr={1}
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
          {tab?.uApp.name}
        </Typography>
      </Grid>
      <Grid item>
        <Grid
          container
          alignItems='center'
          wrap='nowrap'
          spacing={1}
        >
          {tab?.uApp.networks.map(n =>
            <Grid item key={n}>
              <IconWeb3
                size='14px'
                color={tab?.uApp.enabled ? grey[800] : grey[400]}
              >
                {n}
              </IconWeb3>
            </Grid>
          )}
          <Grid item>
            <ButtonDisableTab />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
    {!current &&
      <Typography variant='body2' style={{color: '#78B1D0'}}>
        {tab?.url}
      </Typography>
    }
  </Box>
);

export default Tab;
