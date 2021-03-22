import React, { ChangeEvent, MouseEvent, SetStateAction, Dispatch } from 'react';
import { Button, Grid, TextField, Box, InputAdornment, MenuItem, Select } from '@material-ui/core';
import { formatBalance } from '@polkadot/util';
import useApi from '../hooks/api/useApi';
import { unitPowers, transformCurrency, toDecimals } from '../utils/utils';
import BN from 'bn.js';

interface Props {
  total: BN;
  currency: string;
  hidePercentages?: boolean;
  setAmount: Dispatch<SetStateAction<string>>;
}

// @TODO bn.js

const InputFunds: React.FunctionComponent<Props> = ({ total, setAmount, currency, hidePercentages = false }: Props) => {
	const api = useApi();
	// const [value, setValue] = React.useState<string>('');
	const [showValue, setShowValue] = React.useState<string>('');
	const [currValue, setCurrValue] = React.useState<number>(0);
	const handleChangeButton = (e: MouseEvent) => {
		const val = ((new BN((e.currentTarget as HTMLButtonElement).value)).mul(total)).toString();
		console.log('(e.currentTarget as HTMLButtonElement).value)', total, val);
		setAmount(val);
		document.getElementById('SendFundsAmountField')?.focus();
	};

	const nBN = (val: number | string): BN => new BN(val)
	const handleChange = (e: ChangeEvent) => {
		const value = ((e.currentTarget as HTMLButtonElement).value).replace(/\D/g,'');
		// setCurrencyLevel(value ?
		// 	formatBalance.calcSi(
		// 		value.toString(),
		// 		api.registry.chainDecimals[0]
		// 	)?.value : ''
		// );
		if (value !== '') {
			// console.log('value', ((nBN(value)).mul(nBN(10).pow(-3)).mul((nBN(10)).pow(nBN(12))).toString();
			// const calcValue = currValue >= 0 ?
			// 	((nBN(value)).mul(nBN(10).pow(nBN(currValue)))).mul((nBN(10)).pow(nBN(12))) :
			// 	((nBN(value)).mul(nBN(1).div(nBN(10).pow(nBN(currValue))))).mul((nBN(10)).pow(nBN(12)));
			// console.log('calcValue', calcValue.toNumber(), calcValue.toString())
			setShowValue(value);
			setAmount(value);
		} else{
			setShowValue('');
			setAmount('0');
		} 
	};

	// @TODO focus/blur TextField and %Buttons at the same time in a React way

	const [focus, setFocus] = React.useState<boolean>(false);
	const handleFocus = () => {
		setFocus(!focus);
	};

	const selectDropDownValues = (): JSX.Element[] =>
		// eslint-disable-next-line react/jsx-key
		unitPowers.map(u => <MenuItem value={u.power}>{transformCurrency(u.value, currency)}</MenuItem>)

	return (
		<>
			<Box marginBottom={1}>
				<TextField
					id='SendFundsAmountField'
					value={showValue}
					label="Amount"
					fullWidth
					variant="outlined"
					onChange={handleChange}
					onFocus={handleFocus}
					onBlur={handleFocus}
					{/*
						InputProps={{
							endAdornment: <InputAdornment position="start">
								<Select
									value={currValue}
									onChange={(e) => setCurrValue(e.target.value as number)}
									displayEmpty
									>
									{selectDropDownValues()}
								</Select>
							</InputAdornment>,
						}}
					*/}
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
