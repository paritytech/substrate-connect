import React, { ChangeEvent, MouseEvent, SetStateAction, Dispatch } from 'react';
import { Button, Grid, TextField, Box, InputAdornment } from '@material-ui/core';

interface Props {
  total: number;
  currency: string;
  hidePercentages?: boolean;
  setAmount: Dispatch<SetStateAction<number>>;
}

// @TODO bn.js

const InputFunds: React.FunctionComponent<Props> = ({ total, setAmount, currency, hidePercentages = false }: Props) => {
	const [value, setValue] = React.useState<number | ''>('');
	const handleChangeButton = (e: MouseEvent) => {
		const val = parseFloat((e.currentTarget as HTMLButtonElement).value) * total;
		setValue(val);
		setAmount(val);
		document.getElementById('SendFundsAmountField')?.focus();
	};
	const handleChange = (e: ChangeEvent) => {
		const value = parseFloat((e.currentTarget as HTMLTextAreaElement).value);
		if (!isNaN(value)) {
			setValue(value);
			setAmount(value);
		} else{ 
			setValue('');
			setAmount(0);
		} 
	};

	// @TODO focus/blur TextField and %Buttons at the same time in a React way

	const [focus, setFocus] = React.useState<boolean>(false);
	const handleFocus = () => {
		setFocus(!focus);
	};

	return (
		<>
			<Box marginBottom={1}>
				<TextField
					id='SendFundsAmountField'
					type="number"
					value={value}
					label="Amount"
					fullWidth
					variant="outlined"
					onChange={handleChange}
					onFocus={handleFocus}
					onBlur={handleFocus}
					InputProps={{
						endAdornment: <InputAdornment position="start">{currency}</InputAdornment>,
					}}
				/>
			</Box>

			{!hidePercentages && (
				<Grid container spacing={1}>
					{
					[
							{ label: '25%',  value: 0.25 },
							{ label: '50%',  value: 0.5 },
							{ label: '75%',  value: 0.75 },
							{ label: '100%', value: 1 }
					].map((item, index) => {
							return(
								<Grid key={index} item>
									<Button
										onClick={ handleChangeButton }
										variant='outlined'
										color={focus ? 'primary' : 'default'}
										size='small'
										value={item.value}
								>
										{item.label}
								</Button>
								</Grid>
							);
						})
					}
				</Grid>
			)}
		</>
	);
};

export default InputFunds;
