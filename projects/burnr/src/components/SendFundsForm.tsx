import React, { MouseEvent, useContext } from 'react';
import { AccountContext } from '../utils/contexts';

import { InputAddress, InputFunds } from '../components';
import { makeStyles, createStyles, Theme, Grid, Button } from '@material-ui/core';
import { useBalance } from '../hooks'

const useStyles = makeStyles((theme: Theme) =>
	{
		console.log(theme)
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
	})}
);

const SendFundsForm: React.FunctionComponent = () => {
	const classes = useStyles();
	console.log('classes0, 0', classes)
    const { account } = useContext(AccountContext);
	const balanceArr = useBalance(account.userAddress)
	const amount = parseFloat(balanceArr[0]);
	const unit = balanceArr[3];

	function handleSubmit(e: MouseEvent) {
		e.preventDefault();
	}

	return (
		<Grid
			component='form'
			container
			direction='column'
			className={classes.container}
		>
			<Grid item>
			  <InputAddress />
			</Grid>
			<Grid item>
				<InputFunds 
					total={amount}
					currency={unit}
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
					onClick={handleSubmit}
					className={classes.button}
				>
          Send
				</Button>
			</Grid>
		</Grid>

	);};

export default SendFundsForm;
