import React, { useContext } from 'react';

import { Grid, Button, makeStyles, Theme, createStyles } from '@material-ui/core';
import WhatshotIcon from '@material-ui/icons/Whatshot';

import { AccountContext } from '../utils/contexts';

import { createLocalStorageAccount } from '../utils/utils';
import { useApi, useBalance, useLocalStorage } from '../hooks';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    redButton: {
      backgroundColor: theme.palette.error.main,
      color: 'white',
      marginTop: theme.spacing(12),
      '&:hover': {
        backgroundColor: theme.palette.error.light,
      }
    }
  })
);

const AccountBurn: React.FunctionComponent = () => {
  const classes = useStyles();

  const api = useApi()
  const chainTokens = api.registry.chainTokens

  const [endpoint] = useLocalStorage('endpoint');
  const minEndpoint = endpoint?.split('-')[0]?.toLowerCase();
  const [, setLclStorage] = useLocalStorage(minEndpoint);

  const { account, setCurrentAccount } = useContext(AccountContext);

  const balance = useBalance(account.userAddress);

  const burnAndCreate = (): void => {
  if (!balance[2] && !window.confirm(`Burn keys from account with ${balance[0]} ${chainTokens.join('')}?`)) {
      return
    }
    localStorage.removeItem(minEndpoint);
    const userTmp = createLocalStorageAccount();
    setLclStorage(JSON.stringify(userTmp));
    setCurrentAccount(userTmp);
  };
  
  return (
    <Grid
        container
        justify="center"
        alignItems="center"
      >
        <Grid item>
          <Button
            variant="contained"
            size="large"
            className={classes.redButton}
            startIcon={<WhatshotIcon />}
            onClick={() => burnAndCreate()}>
            Burn
          </Button>
        </Grid>
      </Grid>
  );
};

export default AccountBurn;
