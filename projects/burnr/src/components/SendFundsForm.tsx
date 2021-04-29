import React, { MouseEvent, useContext, useState, useEffect, FunctionComponent } from 'react';
import BN from 'bn.js';
import { 
	makeStyles,
	createStyles,
	Theme,
	Grid,
	Button,
	Typography,
	LinearProgress,
	Table,
	TableContainer } from '@material-ui/core';
import { Keyring } from '@polkadot/api';
import { AccountContext } from '../utils/contexts';
import { InputAddress, InputFunds } from '../components';
import { useBalance, useApi, useLocalStorage } from '../hooks'
import { HistoryTableRow } from '.';
import { isValidAddressPolkadotAddress } from '../utils/utils';
import { Column } from '../utils/types';

import { green } from '@material-ui/core/colors';

const useStyles = makeStyles((theme: Theme) => {
	return createStyles({
		container: {
			marginTop: theme.spacing(3),
		},
		formSubmitContainer: {
			marginTop: theme.spacing(3),
			alignContent: 'center',
      textAlign: 'center'
		},
    feesMessage: {
      width: '100%',
      fontSize: '14px',
      textAlign: 'center'
    },
		button: {
			color: theme.palette.getContrastText(theme.palette.secondary.main),
			'&:hover': {
				color: theme.palette.getContrastText(theme.palette.secondary.dark),
			},
		},
		wrapper: {
			margin: theme.spacing(1),
			position: 'relative',
		},
		buttonProgress: {
			display: 'flex',
			color: green[500],
			position: 'relative',
			marginTop: '5px',
			marginLeft: '15px',
		},
		textProgress: {
			position: 'relative',
			left: '10px',
			textAlign: 'left'
		},
		buttonSuccess: {
			backgroundColor: green[500],
			'&:hover': {
				backgroundColor: green[700],
			},
		},
		linear: {
			width: '100%'
		},
	})
});

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
  const [fee, setFee] = useState<number>(0);

  useEffect((): void => {
    const calcFee = async (): Promise<void> => {
      const keyring = new Keyring({ type: 'sr25519' });
      const sender = keyring.addFromUri(account.userSeed);
      const fee = await api.tx.balances.transfer(address, new BN(amount)).paymentInfo(sender);
      setFee(fee.weight.toNumber());
    };
    (!amount || amount === '0' || !isValidAddressPolkadotAddress(address) || !account.userSeed) ? setFee(0) : void calcFee();
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

  const humanReadable = (amnt: number) => amnt/1000000000000;

	return (
		<Grid
			component='form'
			container
			direction='column'
			className={classes.container}
		>
			<Grid item> 
				<InputAddress setAddress={setAddress} />
			</Grid>
			<Grid item>
				<InputFunds
					total={maxAmountFull}
					currency={unit}
					setAmount={setAmount}
				/>
			</Grid>
      <Grid item xs={12} className={classes.formSubmitContainer}>
        <Typography variant='subtitle1' className={classes.feesMessage}>
          {fee ? `Receiver will get: ${humanReadable(parseFloat(amount))} ${unit}.` : ''}
        </Typography>
        <Typography variant='subtitle1' className={classes.feesMessage}>
          {fee ? `Fees: ${humanReadable(fee)} ${unit}.` : ''}
        </Typography>
        <Typography variant='subtitle1' className={classes.feesMessage}>
          {fee ? `Total Sent: ${humanReadable(parseFloat(amount) + fee)} ${unit}.` : ''}
        </Typography>
      </Grid>
      <Grid item xs={12} className={classes.formSubmitContainer}>
				<Button
					type='submit'
					variant='contained'
					size='large'
					color='secondary'
					disabled={loading || !parseInt(amount) || !isValidAddressPolkadotAddress(address) || account.userAddress === address}
					onClick={handleSubmit}
					className={classes.button}
				>Send</Button>
			</Grid>
			{ countdownNo !== 0 && (
				<Grid item xs={12}>
					<TableContainer className={classes.container}>
						<Table size="small" stickyHeader>
							<HistoryTableRow
								row={{
									withWhom: address,
									extrinsic: 'Transfer',
									value: parseFloat(amount),
									status: rowStatus
								}}
                unit={unit}
								columns={columns} />
						</Table>
					</TableContainer>
				</Grid>	
			)}
			<Grid item xs={12} className={classes.formSubmitContainer}>
				<Typography variant='subtitle2' className={classes.textProgress}>{message}</Typography>
			</Grid>
			<Grid item xs={12} className={classes.formSubmitContainer}>
				{!loading && countdownNo !== 0 && <div className={classes.linear}><LinearProgress variant="determinate" value={countdownNo} /></div>}
			</Grid>
		</Grid>
	);
};

export default SendFundsForm;
