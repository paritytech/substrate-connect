import React, { MouseEvent, useContext, useState, useEffect, FunctionComponent } from 'react';
import BN from 'bn.js';
import { 
  makeStyles,
  Theme,
  Button,
  Typography,
  LinearProgress,
  Table,
  Box} from '@material-ui/core';
import { decodeAddress, encodeAddress } from '@polkadot/keyring';
import { hexToU8a, isHex } from '@polkadot/util';
import { Keyring } from '@polkadot/api';
import { AccountContext } from '../utils/contexts';
import { InputAddress, InputFunds } from '../components';
import { useBalance, useApi, useLocalStorage } from '../hooks'
import { HistoryTableRow } from '.';
import { Column } from '../utils/types';

const useStyles = makeStyles((theme: Theme) => ({
  errorMessage: {
    marginBottom: theme.spacing(),
    textAlign: 'center'
  },
  button: {
    color: theme.palette.getContrastText(theme.palette.secondary.main),
    '&:hover': {
      color: theme.palette.getContrastText(theme.palette.secondary.dark),
    },
  }
}));

const columns: Column[] = [
  { id: 'withWhom', label: '', width: 160},
  { id: 'extrinsic', label: 'Extrinsic'},
  { id: 'value', label: 'Value', minWidth: 170, align: 'right' },
  { id: 'status', label: 'Status', width: 40, align: 'right' }
];

const SendFundsForm: FunctionComponent = () => {
  const classes = useStyles();
  const { account, setCurrentAccount } = useContext(AccountContext);
  const balanceArr = useBalance(account.userAddress);
  const api = useApi();
  const maxAmountFull = balanceArr[1];
  const unit = balanceArr[3];
  // TODO: This must be prettier and reusable (exists already on App)
  const [endpoint, setEndpoint] = useLocalStorage('endpoint');
  if (!endpoint) setEndpoint('Polkadot-WsProvider');
  const [ ,setLocalStorageAccount] = useLocalStorage(endpoint.split('-')[0]?.toLowerCase());
  // TODO END: This must be prettier and reusable (exists already on App)
  const [address, setAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('0');  
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [countdownNo, setCountdownNo] = useState<number>(0);
  const [rowStatus, setRowStatus] = useState<number>(0);

  useEffect((): () => void => {
    let countdown: ReturnType<typeof setInterval>;
    if(!loading) {
      if (message != '') {
        countdown = setInterval((): void => {
          setCountdownNo((oldCountdownNo: number) => {
            if (oldCountdownNo === 0) {
              setMessage('');
              return 0;
            } else {
              return oldCountdownNo - 1;
            }
          })
        }, 100);
      }
    }
    return () => {
      clearInterval(countdown);
    }
  }, [loading, message, setMessage])

  const handleSubmit = async (e: MouseEvent) => {
    try {
      e.preventDefault();
      setLoading(true);
      setCountdownNo(100);
      setRowStatus(3);
      const keyring = new Keyring({ type: 'sr25519' });
      const sender = keyring.addFromUri(account.userSeed);
      await api.tx.balances.transfer(address, new BN(amount)).signAndSend(sender, (result) => {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        setMessage(`Current transaction status ${result.status}`);
        if (result.status.isInBlock) {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          setMessage(`Transaction Block hash: ${result.status.asInBlock}`);
        } else if (result.status.isFinalized) {
          setLoading(false);
          setRowStatus(1);
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          setMessage(`Block hash:: ${result.status.asFinalized}.`);
          account.userHistory.unshift({
            withWhom: address,
            extrinsic: 'Transfer',
            value: amount, 
            status: 1
          })
          setCurrentAccount(account);
          setLocalStorageAccount(JSON.stringify(account));
        }
      });
    } catch (err) {
      setLoading(false);
      setRowStatus(2);
      setMessage(`😞 Error: ${err}`);
      account.userHistory.unshift({
        withWhom: address,
        extrinsic: 'Transfer',
        value: amount,
        status: 2
      })
      setCurrentAccount(account);
      setLocalStorageAccount(JSON.stringify(account));
    }
  }

  const isValidAddressPolkadotAddress = (add = '') => {
    try {
      encodeAddress(
        isHex(add)
          ? hexToU8a(add.toString())
          : decodeAddress(add)
      );
  
      return true;
    } catch (error) {
      return false;
    }
  };

  return (
    <>
      <InputAddress setAddress={setAddress} />
      <InputFunds
        hidePercentages
        total={maxAmountFull}
        currency={unit}
        setAmount={setAmount}
      />
      <Button
        type='submit'
        variant='contained'
        size='large'
        color='secondary'
        disabled={loading || !parseInt(amount) || !isValidAddressPolkadotAddress(address) || account.userAddress === address}
        onClick={handleSubmit}
        className={classes.button}
      >Send</Button>

      {!isValidAddressPolkadotAddress(address) &&
        <Typography variant='body2' color='error' className={classes.errorMessage}>
          You need to add a valid address.
        </Typography>
      }
      {!parseInt(amount) &&
        <Typography variant='body2' color='error' className={classes.errorMessage}>
        You should add some amount.
        </Typography>
      }
      
      <Box mt={3}>
        { countdownNo !== 0 && 
          <Table size="small">
            <HistoryTableRow
              row={{
                withWhom: address,
                extrinsic: 'Transfer',
                value: amount,
                status: rowStatus
              }}
              unit={unit}
              columns={columns} />
          </Table>
        }
        <Typography variant='subtitle2'>{message}</Typography>
        {!loading && countdownNo !== 0 &&
          <LinearProgress variant="determinate" value={countdownNo} />
        }
      </Box>
    </>
  );
};

export default SendFundsForm;
