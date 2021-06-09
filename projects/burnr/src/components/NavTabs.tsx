import React, { useContext } from 'react';

import { Tabs, Tab, Typography, Box, Paper, makeStyles, Theme } from '@material-ui/core';
import SwapHorizSharpIcon from '@material-ui/icons/SwapHorizSharp';
import CallMadeSharpIcon from '@material-ui/icons/CallMadeSharp';
import CallReceivedSharpIcon from '@material-ui/icons/CallReceivedSharp';
import WhatshotSharpIcon from '@material-ui/icons/WhatshotSharp';

import { SendFundsForm, ReceiveFundsForm, BurnrDivider, HistoryTable } from '../components';

import { useApi, useBalance, useLocalStorage } from '../hooks';
import { AccountContext } from '../utils/contexts';
import { createLocalStorageAccount } from '../utils/utils';
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    minHeight:'calc(100vh - 265px)',
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,

    [theme.breakpoints.down('sm')]: {
      minHeight:'calc(100vh - 320px)',
    },
  },
  rootHeading: {
    marginBottom: theme.spacing(3),
  },
  tabBurn: {
    '& svg, & .MuiTab-wrapper': {
      color: theme.palette.error.main
    }
  },
  rootTabs: {
    '& .MuiTab-root': {
      minHeight: theme.spacing(8),
      padding: 0,
      ...theme.typography.overline,
      lineHeight: 1
    }
  }
}));

const TabPanel: React.FunctionComponent<TabPanelProps> = ({ children, value, index, ...props }: TabPanelProps) => {
  return (
    <div
      hidden={value !== index}
      id={`tabpanel-${index}`}
      {...props}
    >
      {value === index && (
        <Box p={2}>
          {children}
        </Box>
      )}
    </div>
  );
};

const NavTabs: React.FunctionComponent = () => {
  const classes = useStyles();
  const [value, setValue] = React.useState(1);

  const api = useApi();
  const [endpoint] = useLocalStorage('endpoint');
  const minEndpoint = endpoint?.split('-')[0]?.toLowerCase();
  const { account, setCurrentAccount } = useContext(AccountContext);
  const balance = useBalance(account.userAddress);

  const handleChange = (event: React.ChangeEvent<unknown>, newValue: number) => {
    if (newValue === 0) {
      if (!balance[2] && !window.confirm(`Burn keys from account with ${balance[0].toString()} ${api.registry.chainTokens.toString()}?`)) {
        return
      }
      localStorage.removeItem(minEndpoint);
      const userTmp = createLocalStorageAccount();
      setCurrentAccount(userTmp);
      return
    }
    setValue(newValue);
  };

  return (
    <>
      <Paper square>
        <Tabs
          value={value}
          onChange={handleChange}
          variant='fullWidth'
          className={classes.rootTabs}
        >
          <Tab label="Burn Account" icon={<WhatshotSharpIcon fontSize='small'/>} className={classes.tabBurn}/>
          <Tab label="Receipts" icon={<SwapHorizSharpIcon fontSize='small'/>} />
          <Tab label="Send" icon={<CallMadeSharpIcon fontSize='small'/>} />
          <Tab label="Receive" icon={<CallReceivedSharpIcon fontSize='small'/>} />
        </Tabs>
      </Paper>

      <BurnrDivider />

      <Paper className={classes.root}>
        <TabPanel value={value} index={1}>
          <Typography variant='h2' className={classes.rootHeading}>
            Transaction History
          </Typography>
          <HistoryTable />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <Typography variant='h2' className={classes.rootHeading}>
            Send Funds
          </Typography>
          <SendFundsForm />
        </TabPanel>
        <TabPanel value={value} index={3}>
          <Typography variant='h2' className={classes.rootHeading}>
            Receive Funds
          </Typography>
          <ReceiveFundsForm />
        </TabPanel>
      </Paper>
    </>
  );
};

export default NavTabs;
