/* eslint-disable @typescript-eslint/no-unsafe-call */
import React, { FunctionComponent, SetStateAction, Dispatch } from 'react';
import { Typography, Box, IconButton, createStyles, makeStyles } from '@material-ui/core';
import BlockIcon from '@material-ui/icons/Block';
import Zoom from '@material-ui/core/Zoom';
import Tooltip from '@material-ui/core/Tooltip';
import { grey } from '@material-ui/core/colors';
import { IconWeb3, Logo } from '.';
import { TabInterface } from '../types';
import { ConnectionManager } from '../background/ConnectionManager';

interface TabProps {
  manager?: ConnectionManager;
  current?: boolean;
  tab?: TabInterface;
  setActiveTab?: Dispatch<SetStateAction<TabInterface | undefined>>;
}

const useStylesBootstrap = makeStyles((theme) => ({
  arrow: {
    color: theme.palette.common.black,
  },
  tooltip: {
    backgroundColor: theme.palette.common.black,
    fontSize: 14,
  },
}));

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

const BootstrapTooltip = (props: any) => {
  const classes = useStylesBootstrap();
  return <Tooltip arrow classes={classes} {...props} />;
}

const Tab: FunctionComponent<TabProps> = ({ manager, tab, current=false, setActiveTab }) => {
  const classes = useStyles();
  /**
     * If Tab that initiated this function has a tabId (check for validity) then disconnectTab 
     * function will be called to disconnect the tab. At the same time, in case the tan is marked as current
     * (meaning opened at the same window) - it is ensured that it will be removed from UI through passing setActiveTab
     * Dispatcher.
    **/ 
  const onDisconnect = (): void => {
    if (tab && tab.tabId) {
      /* TODO(nik): Fix smoldot definition (see: https://github.com/paritytech/substrate-connect/blob/3350cdff9c4c294393160189816168a93c983f79/projects/extension/src/background/ConnectionManager.ts#L202)
      ** eslint disable below seems to be due to smoldot definition */ 
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      manager?.disconnectTab(tab.tabId);
      if (setActiveTab && current) {
        setActiveTab(undefined);
      }
    }
  }

  return (
    <Box pt={current ? 2 : 1} pb={1} pr={1} pl={0.8} style={!tab ? { height: '10px' } : {}}>
      <Box
        display='flex'
        alignItems='center'
        justifyContent='space-between'
      >
        {tab && (
        <>
          <Typography noWrap variant={current ? 'h3' : 'h4'}>
            {tab.uApp.name}
          </Typography>
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
              {/* TODO: Disconnect should be replacesd with Block/Unblock once functionality is implemented */}
              <BootstrapTooltip title={'Disconnect this app'} TransitionComponent={Zoom} placement={'top'}>
                <BlockIcon />
              </BootstrapTooltip>
            </IconButton>
          </Box>
        </>
        )}
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
