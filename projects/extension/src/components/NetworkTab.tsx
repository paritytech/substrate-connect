import React, { useEffect, useState, ChangeEvent } from 'react';
import { IconWeb3, StatusCircle } from '.';
import { withStyles, makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import MuiAccordion from '@material-ui/core/Accordion';
import MuiAccordionSummary from '@material-ui/core/AccordionSummary';
import MuiAccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { Detector }  from '@substrate/connect';

import { Network } from '../types';

export const emojis = {
  info: 'ℹ️',
  deal: '🤝',
  chain: '✨',
  clock: '🕒',
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
      marginBottom: '10px',
      display: 'flex'
    },
    onlineIcon: {
      width: '30px',
      position: 'relative',
      top: '20px'
    },
    accordion: {
      width: '100%',
      border: '1px solid #ccc',
      borderTopLeftRadius: '3px',
      borderTopRightRadius: '3px'
    },
    summary: {
      display: 'flex',
      alignItems: 'center',
      flexBasis: '66.66%',
    },
    icon: {
      width: '30px',
    },
    heading: {
      fontSize: theme.typography.pxToRem(20),
      lineHeight: '24px',
      marginLeft: '5px',
      flexShrink: 0,
    },
    secondaryHeading: {
      fontSize: theme.typography.pxToRem(15),
      color: theme.palette.text.secondary,
    },
    content: {
      backgroundColor: '#21262A',
      color: '#fff',
      borderBottomLeftRadius: '3px',
      borderBottomRightRadius: '3px'
    },
    info: {
      fontSize: '15px'
    }
  }),
);

interface NetworkContentProps {
  genesisHash: string
  headerNumber: string
  chainName: string
  epoch: number
  existentialDeposit: string
  healthPeers: number
}

const NetworkContent = ({
  genesisHash,
  headerNumber,
  chainName,
  epoch,
  existentialDeposit,
  healthPeers
}: NetworkContentProps) => {
  const classes = useStyles();

  return headerNumber ?
    <div className={classes.info}>
      <p>{emojis.chain} Connected to <b>{chainName}</b></p>
      <p>{emojis.deal} Syncing will start at block #{headerNumber}</p>
      <p>{emojis.info} Genesis hash is {genesisHash}</p>
      <p>{emojis.clock} Epoch duration is {epoch} blocks</p>
      <p>{emojis.info} Existential deposit is {existentialDeposit}</p>
      <p>{emojis.seedling} Communicating with {healthPeers} peer{healthPeers === 1 ? '' : 's'}</p>
    </div> :
    <div>Loading...</div>
}

const NetworkTab = ({ name, status, isKnown, chainspecPath }: Network) => {
  const classes = useStyles();
  const [expanded, setExpanded] = useState<boolean>(false);
  const [genesisHash, setGenesisHash] = useState<string>('');
  const [headerNumber, setHeaderNumber] = useState<string>('');
  const [chainName, setChainName] = useState<string>('');
  const [epoch, setEpoch] = useState<number>(0);
  const [existentialDeposit, setExistentialDeposit] = useState<string>('');
  const [healthPeers, setHealthPeers] = useState<number>(0);

  useEffect(() => {
    const detect: Detector = new Detector('Extension App');
    const connectToNetwork = async (detect: Detector) => {
      const api = await detect.connect(name);
      const header = await api.rpc.chain.getHeader()
      const cn = await api.rpc.system.chain();
      const health = await api.rpc.system.health();
      setHeaderNumber(header.number.toString());
      setGenesisHash(api.genesisHash.toHex())
      setHealthPeers(health.peers.toNumber());
      setChainName(cn.toString());
      setEpoch(api.consts.babe.epochDuration.toNumber());
      setExistentialDeposit(api.consts.balances.existentialDeposit.toHuman());
    }
    name && connectToNetwork(detect);
  }, [name]);

  return (
    <div className={classes.root}>
      <div className={classes.onlineIcon}>
        <StatusCircle
          size="medium"
          borderColor="#16DB9A"
          color={!headerNumber ? 'transparent' : '#16DB9A'} />
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
            <Typography className={classes.secondaryHeading}>Peer{healthPeers === 1 ? '' : 's'}: {healthPeers ?? '..'}</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails className={classes.content}>
          <NetworkContent
            genesisHash={genesisHash}
            headerNumber={headerNumber}
            chainName={chainName}
            epoch={epoch}
            existentialDeposit={existentialDeposit}
            healthPeers={healthPeers}
          />
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

export default NetworkTab;
