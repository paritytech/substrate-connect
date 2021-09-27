import React, { FunctionComponent, useState } from 'react';
import { IconWeb3, StatusCircle } from '.';
import { withStyles, makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import MuiAccordion from '@material-ui/core/Accordion';
import MuiAccordionSummary from '@material-ui/core/AccordionSummary';
import MuiAccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

import { NetworkTabProps, App, OptionsNetworkTabHealthContent } from '../types';
import { Grid } from '@material-ui/core';

export const emojis = {
  chain: '🔗',
  tick: '✅',
  info: 'ℹ️',
  deal: '🤝',
  chequeredFlag: '🏁',
  star: '✨',
  clock: '🕒',
  apps: '📺',
  seedling: '🌱'
};

const Accordion = withStyles({
  root: {
    border: '1px solid rgba(0, 0, 0, .125)',
    boxShadow: 'none',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
    '&$expanded': {
      margin: 'auto',
    },
  },
  expanded: {},
})(MuiAccordion);

const AccordionSummary = withStyles({
  root: {
    justifyContent: 'space-between',
    minHeight: 48,
    '&$expanded': {
      minHeight: 48,
    },
  },
  content: {
    justifyContent: 'space-between',
    '&$expanded': {
      margin: '12px 0',
    },
  },
  expanded: {},
})(MuiAccordionSummary);

const AccordionDetails = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiAccordionDetails);

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      marginBottom: theme.spacing(1),
      display: 'flex'
    },
    onlineIcon: {
      width: theme.spacing(3),
      position: 'relative',
      top: theme.spacing(2)
    },
    accordion: {
      width: '100%',
      border: '1px solid #ccc',
      borderTopLeftRadius: theme.spacing(0.3),
      borderTopRightRadius: theme.spacing(0.3)
    },
    summary: {
      display: 'flex',
      alignItems: 'center',
      flexBasis: '66.66%',
    },
    icon: {
      width: theme.spacing(3),
    },
    heading: {
      fontSize: theme.typography.pxToRem(20),
      lineHeight: '24px',
      marginLeft: theme.spacing(0.5),
      flexShrink: 0,
    },
    secondaryHeading: {
      fontSize: theme.typography.pxToRem(15),
      color: theme.palette.text.secondary,
    },
    content: {
      backgroundColor: '#21262A',
      color: '#fff',
      borderBottomLeftRadius: theme.spacing(0.3),
      borderBottomRightRadius: theme.spacing(0.3)
    },
    info: {
      fontSize: theme.typography.pxToRem(15)
    }
  }),
);

interface NetworkContentProps {
  health: OptionsNetworkTabHealthContent;
  apps: App[];
  network: string;
}

const NetworkContent = ({
  network,
  health,
  apps
}: NetworkContentProps) => {
  const classes = useStyles();
  const peers = health && health.peers;
  const status = health && health.status;
  const isSyncing = health && health.isSyncing;
  
  return (
    <div className={classes.info}>
      <Grid container>
        <Grid item xs={3}>{emojis.seedling} Light Client</Grid>
        <Grid item xs={9}>{isSyncing ? 'Synching' : 'Synched'}</Grid>
        <Grid item xs={3}>{emojis.star} Network</Grid>
        <Grid item xs={9}>{network}<br /> Chain is {status}</Grid>
        <Grid item xs={3}>{emojis.deal} Peers</Grid>
        <Grid item xs={9}>{peers}</Grid>
        <Grid item xs={3}>{emojis.apps} Apps</Grid>
        <Grid item xs={9}>{apps.length}:</Grid>
        <Grid item xs={3}></Grid>
        <Grid item xs={9}>
          {apps.map(app => (
              <Grid container>
                 <Grid item xs={6}>{app.name}</Grid>
                 <Grid item xs={1}>-</Grid>
                 <Grid item xs={5}>{app.url}</Grid>
              </Grid>
            )
          )}
        </Grid>
      </Grid>
    </div>
  );
}

const NetworkTab: FunctionComponent<NetworkTabProps> = ({
    name,
    health,
    apps }: NetworkTabProps
    ) => {
  const classes = useStyles();
  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <div className={classes.root}>
      <div className={classes.onlineIcon}>
        <StatusCircle
          size="medium"
          borderColor="#16DB9A"
          color={health && health.status === 'connected' ? '#16DB9A' : 'transparent'} />
      </div>
      <Accordion
        TransitionProps={{ unmountOnExit: true }}
        className={classes.accordion}
        elevation={0}
        onChange={() => setExpanded(!expanded)}
        expanded={expanded}>
        <AccordionSummary
          expandIcon={<ArrowDropDownIcon style={{ color: '#ABB8BF' }}/>}
        >
          <div className={classes.summary}>
            <div className={classes.icon}>
              <IconWeb3 size={'20px'}>{name}</IconWeb3>
            </div>
            <Typography className={classes.heading}>{name}</Typography>
          </div>
          <div>
            <Typography className={classes.secondaryHeading}>Peer{health && health.peers === 1 ? '' : 's'}: {(health && health.peers) ?? '..'}</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails className={classes.content}>
          <NetworkContent health={health} apps={apps} network={name}/>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

export default NetworkTab;
