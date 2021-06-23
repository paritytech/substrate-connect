import React, { ChangeEvent, MouseEvent, SetStateAction, Dispatch } from 'react';
import { Button, Grid, TextField, Box, InputAdornment } from '@material-ui/core';
import { useApi } from '../hooks';
import BN from 'bn.js';

interface Props {
  total: BN;
  currency: string;
  hidePercentages?: boolean;
  setAmount: Dispatch<SetStateAction<string>>;
}

const InputFunds: React.FunctionComponent<Props> = ({ total, setAmount, currency, hidePercentages = false }: Props) => {
  const api = useApi();
  const [showValue, setShowValue] = React.useState<string>('');

	const handleChange = (e: ChangeEvent | MouseEvent, fromButtons = false) => {
    if ((e.currentTarget as HTMLButtonElement).value?.length > 6 ) return;
    if (fromButtons) {
      const calcNewTotal = (parseFloat((e.currentTarget as HTMLButtonElement).value) * parseInt(new BN(total).toString()));
      const truncDec = Math.trunc(calcNewTotal);
      setShowValue((calcNewTotal).toString() !== '' ? (truncDec/Math.pow(10, api.registry.chainDecimals[0])).toFixed(4) : '');
      setAmount((truncDec).toString());
      document.getElementById('SendFundsAmountField')?.focus();
    } else {
      const value = (e.currentTarget as HTMLButtonElement).value;
      const v: number = (parseFloat(value) * Math.pow(10, api.registry.chainDecimals[0]));
      setShowValue(value !== '' ? value : '');
      setAmount(value !== '' ? v.toString() : '0');
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
          value={showValue}
          label="Amount"
          fullWidth
          type="number"
          variant="outlined"
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleFocus}
          InputProps={{
            fullWidth: true,
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
                    onClick={(e) => handleChange(e, true) }
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
