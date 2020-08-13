import React from 'react';

import { InputAddress, InputFunds } from '.';
import { makeStyles, createStyles, Theme, Grid, Button } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
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
	})
);

const SendFundsForm: React.FunctionComponent = () => {
	const classes = useStyles();

	function handleSubmit(event) {
		event.preventDefault();
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
					total={100}
					currency={'KSM'}
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
