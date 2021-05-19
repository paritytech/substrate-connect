import React, { ChangeEvent, MouseEvent, SetStateAction, Dispatch } from 'react';
import { Button, Grid, TextField, Box, InputAdornment } from '@material-ui/core';
import BN from 'bn.js';

interface Props {
  total: BN;
  currency: string;
  hidePercentages?: boolean;
  setAmount: Dispatch<SetStateAction<string>>;
}

const InputFunds: React.FunctionComponent<Props> = ({ total, setAmount, currency, hidePercentages = false }: Props) => {
  // const [value, setValue] = React.useState<string>('');
  const [showValue, setShowValue] = React.useState<string>('');
  const handleClickButton = (e: MouseEvent) => {
    const val = ((new BN((e.currentTarget as HTMLButtonElement).value)).mul(total)).toString();
    setAmount(val);
    document.getElementById('SendFundsAmountField')?.focus();
  };
  const handleChange = (e: ChangeEvent) => {
    const value = (e.currentTarget as HTMLButtonElement).value;
    const v: number = parseFloat(value);
    setShowValue(value !== '' ? value : '');
    setAmount(value !== '' ? (v * 1000000000000).toString() : '0');
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
                    onClick={ handleClickButton }
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
