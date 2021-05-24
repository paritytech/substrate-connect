import React, { FunctionComponent } from 'react';
import { Typography, Box, IconButton, createStyles, makeStyles } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { grey } from '@material-ui/core/colors';
import { IconWeb3 } from '../components';
import { TabInterface } from '../types';
import { ConnectionManager } from 'background/ConnectionManager';

interface TabProps {
  manager: ConnectionManager;
  current?: boolean;
  tab?: TabInterface;
}

const useStyles = makeStyles((theme) =>
  createStyles({
    disableButton: {
      color: theme.palette.text.hint,
      marginLeft: theme.spacing(),
      '&:not(:hover)': {
        opacity: 0.2,
      },
      '& svg': {
        fontSize: '0.8rem',
      }
    }
  })
);

const Tab: FunctionComponent<TabProps> = ({ manager, tab, current=false }) => {
  const classes = useStyles();
  const onDisconnect = (): void => {
    tab && tab.tabId && manager.disconnectTab(tab.tabId as number);
  }

  return (
    <Box pt={current ? 2 : 1} pb={1} pr={1} pl={3}>
      <Box
        display='flex'
        alignItems='center'
        justifyContent='space-between'
      >
        <Typography noWrap variant={current ? 'h3' : 'h4'}>
          {tab ? tab.uApp.name : 'substrate connect'}
        </Typography>

        { tab &&
          <Box display='flex'alignItems='center'> 
            {tab?.uApp.networks.map(n =>
              <IconWeb3
                key={n}
                size='14px'
                color={tab?.uApp.enabled ? grey[800] : grey[400]}
              >
                {n}
              </IconWeb3>
            )}
            <IconButton onClick={onDisconnect} size='small' className={classes.disableButton}>
              <CloseIcon />
            </IconButton>
          </Box>
        }
      </Box>

      {!current &&
        <Typography variant='body2' color='secondary'>
          {tab?.url}
        </Typography>
      }
    </Box>
  );
}

export default Tab;
