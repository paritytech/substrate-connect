import React, { MouseEvent, useContext, useState } from 'react';
import { AccountContext } from '../utils/contexts';
import { Keyring } from '@polkadot/api';
import { InputAddress, InputFunds } from '../components';
import { makeStyles, createStyles, Theme, Grid, Button, CircularProgress } from '@material-ui/core';
import { useBalance, useApi } from '../hooks'
import { green } from '@material-ui/core/colors';

const useStyles = makeStyles((theme: Theme) => {
	return createStyles({
		container: {
			marginTop: theme.spacing(3),
		},
		formSubmitContainer: {
			display: 'flex',
			marginTop: theme.spacing(3),
			alignContent: 'center',
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
			color: green[500],
			position: 'relative',
			top: '50%',
			left: '20px',
			marginTop: -12,
			marginLeft: -12,
		},
		textProgress: {
			position: 'relative',
			left: '30px',
			textAlign: 'left'
		},
		buttonSuccess: {
			backgroundColor: green[500],
			'&:hover': {
				backgroundColor: green[700],
			},
		}
	})
})

const SendFundsForm: React.FunctionComponent = () => {
	const classes = useStyles();
	const { account } = useContext(AccountContext);
	const balanceArr = useBalance(account.userAddress);
	const api = useApi();
	const maxAmount = parseFloat(balanceArr[0]);
	const unit = balanceArr[3];

	const [address, setAddress] = useState<string>('');
	const [amount, setAmount] = useState<number>(0);  
	const [loading, setLoading] = useState<boolean>(false);
	const [message, setMessage] = useState<string>('');

	const handleSubmit = async (e: MouseEvent) => {
		e.preventDefault();
		const keyring = new Keyring({ type: 'sr25519' });
		const sender = keyring.addFromUri(account.userSeed);
		await api.tx.balances.transfer(address, amount * 1000000000000).signAndSend(sender, (result) => {
			setLoading(true);
			setMessage(`Current status is ${result.status}`);
			console.log(`Current status is ${result.status}`);
			if (result.status.isInBlock) {
				setMessage(`Transaction included at blockHash ${result.status.asInBlock}`);
				console.log(`Transaction included at blockHash ${result.status.asInBlock}`);
			} else if (result.status.isFinalized) {
				setLoading(false);
				setMessage(`Transaction finalized at blockHash ${result.status.asFinalized}`);
				console.log(`Transaction finalized at blockHash ${result.status.asFinalized}`);
			}
		});
	}

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
					total={maxAmount}
					currency={unit}
					setAmount={setAmount}
				/>
			</Grid>
			<Grid
				item
				xs={12}
				className={classes.formSubmitContainer}
			>
				<Button
					type='submit'
					variant='contained'
					size='large'
					color='secondary'
					disabled={loading}
					onClick={handleSubmit}
					className={classes.button}
				>
			Send
				</Button>
				{loading && (
					<>
						<CircularProgress size={24} className={classes.buttonProgress} />
						<div className={classes.textProgress}>{message}</div>
					</>)
				}
			</Grid>
		</Grid>
	);
};

export default SendFundsForm;
