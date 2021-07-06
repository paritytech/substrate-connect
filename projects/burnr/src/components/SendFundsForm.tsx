/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import React, { MouseEvent, useContext, useState, useEffect, FunctionComponent } from 'react';
import BN from 'bn.js';
import { 
  makeStyles,
  Theme,
  Button,
  Typography,
  LinearProgress,
  Table,
  Grid,
  Box} from '@material-ui/core';
import { Balance } from '@polkadot/types/interfaces';
import { Keyring } from '@polkadot/api';
import { AccountContext } from '../utils/contexts';
import { InputAddress, InputFunds } from '../components';
import { useBalance, useApi, useLocalStorage } from '../hooks'
import { HistoryTableRow } from '.';
import { isValidAddressPolkadotAddress, prettyBalance } from '../utils/utils';
import { Column } from '../utils/types';
import { ALL_PROVIDERS } from '../utils/constants';

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
  },
  transferInfoMessage: {
    overflowWrap: 'break-word',
    padding: '30px'
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
  if (!endpoint) {
    setEndpoint(Object.keys(ALL_PROVIDERS)[0]);
  }
  const [ ,setLocalStorageAccount] = useLocalStorage(endpoint.split('-')[0]?.toLowerCase());
  // TODO END: This must be prettier and reusable (exists already on App)
  const [address, setAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('0');
  const [fundsIssue, setFundsIssue] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [countdownNo, setCountdownNo] = useState<number>(0);
  const [rowStatus, setRowStatus] = useState<number>(0);
  const [fee, setFee] = useState<Balance | undefined>();
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect((): void => {
    const calcFee = async (): Promise<void> => {
      const keyring = new Keyring({ type: 'sr25519' });
      const sender = keyring.addFromUri(account.userSeed);
      const fee = await api.tx.balances.transfer(address, new BN(amount)).paymentInfo(sender);
      setFee(fee.partialFee);
    };
    (!amount || amount === '0' || !isValidAddressPolkadotAddress(address) || !account.userSeed) ? setFee(undefined) : void calcFee();
  }, [amount, account.userSeed, address, api.tx.balances]);

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
        setMessage(`Current transaction status ${result.status}`);
        if (result.status.isInBlock) {
          setMessage(`Transaction Block hash: ${result.status.asInBlock}`);
        } else if (result.status.isFinalized) {
          setRowStatus(1);
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
      setLoading(false);
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

  useEffect(() => {
    maxAmountFull && amount && fee && setFundsIssue((new BN(maxAmountFull)).sub(new BN(amount)).sub(fee).isNeg());
  }, [amount, fee, maxAmountFull])

  useEffect(() => {
    if (!isValidAddressPolkadotAddress(address)) {
      setErrorMsg('Add a valid address');
    } else if (!parseInt(amount)) {
      setErrorMsg('Add some amount');
    } else if (fundsIssue) {
      setErrorMsg('Insufficient funds');
    } else {
      setErrorMsg('');
    }
  }, [address, amount, fundsIssue])

  return (
    <>
      <InputAddress setAddress={setAddress} />
      <InputFunds
        hidePercentages
        total={maxAmountFull}
        currency={unit}
        setAmount={setAmount}
      />
      <Grid item xs={12}>
        <Typography variant='subtitle1'>
          {fee ? `Balance after transaction: ${prettyBalance((new BN(maxAmountFull)).sub(new BN(amount)).sub(fee))} ${unit}` : ''}
        </Typography>
        <Typography variant='subtitle1'>
          {fee ? `Fees: ${prettyBalance(fee)} ${unit}` : ''}
        </Typography>
        <Typography variant='subtitle1'>
        </Typography>
      </Grid> 
      <Button
        type='submit'
        variant='contained'
        size='large'
        color='secondary'
        disabled={loading || !parseInt(amount) || !isValidAddressPolkadotAddress(address) || account.userAddress === address || fundsIssue}
        onClick={handleSubmit}
        className={classes.button}
      >Send</Button>

      {errorMsg &&
        <Typography variant='body2' color='error' className={classes.errorMessage}>
          {errorMsg}
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
        <Typography variant='subtitle2' className={classes.transferInfoMessage}>{message}</Typography>
        {!loading && countdownNo !== 0 &&
          <LinearProgress variant="determinate" value={countdownNo} />
        }
      </Box>
    </>
  );
};

export default SendFundsForm;
