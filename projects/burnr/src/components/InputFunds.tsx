import React from 'react';

import { Button, Grid, TextField, Box, InputAdornment } from '@material-ui/core';

interface Props {
  total: number;
  currency: string;
}

const InputFunds: React.FunctionComponent<Props> = ({ total, currency }: Props) => {
	const [value, setValue] = React.useState<number | ''>('');
	const handleChangeButton = (e) => {
		setValue(e.currentTarget.value * total);
		document.getElementById('SendFundsAmountField').focus();
	};
	const handleChange = (e) => {
		!isNaN(e.currentTarget.value) && setValue(parseInt(e.currentTarget.value));
	};

	const [focus, setFocus] = React.useState<boolean>(false);
	const handleFocus = () => {
		setFocus(!focus);

	};

	return (
		<>
			<Box marginBottom={1}>
				<TextField
					id='SendFundsAmountField'
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

			<Grid container spacing={1}>
				<Grid item>
					<Button
						onClick = { handleChangeButton }
						variant="outlined"
						color={focus ? 'primary' : 'default'}
						size='small'
						value={0.25}
					>
            25%
					</Button>
				</Grid>
				<Grid item>
					<Button
						onClick = { handleChangeButton }
						variant="outlined"
						color={focus ? 'primary' : 'default'}
						size='small'
						value={0.5}
					>
            50%
					</Button>
				</Grid>
				<Grid item>
					<Button
						onClick = { handleChangeButton }
						variant="outlined"
						color={focus ? 'primary' : 'default'}
						size='small'
						value={0.75}
					>
            75%
					</Button>
				</Grid>
				<Grid item>
					<Button
						onClick = { handleChangeButton }
						variant="outlined"
						color={focus ? 'primary' : 'default'}
						size='small'
						value={1}
					>
            100%
					</Button>
				</Grid>
			</Grid>
		</>
	);
};

export default InputFunds;
