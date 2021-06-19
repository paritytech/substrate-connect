import React from 'react';

import { makeStyles, Theme } from '@material-ui/core/styles';
import { Box, Typography } from '@material-ui/core';
import { SizeScale } from '../utils/types';
import { transformCurrency } from '../utils/utils';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import { Balance } from '@polkadot/types/interfaces';
import { formatBalance } from '@polkadot/util';
import useApi from '../hooks/api/useApi';

interface Props extends SizeScale {
  value: Balance;
  isVisible: boolean;
  unit?: string;
  style?: CSSProperties;
}
interface StyleProps {
  colored?: boolean;
  visible?: boolean;
}

// @TODO get token codes from api
const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'inline-flex',
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    borderRadius: theme.spacing(0.5),
    backgroundColor: (props: StyleProps) =>
      props.colored
        ? theme.palette.primary.light
        : '',
    color: (props: StyleProps) =>
      props.colored
        ? theme.palette.getContrastText(theme.palette.primary.light)
        : theme.palette.text.primary,
  },
  blur: {
    filter: (props: StyleProps) =>
      props.visible
        ? 'unset'
        : 'blur(5px)'
  }
}));

const BalanceValue: React.FunctionComponent<Props> = ({ value, isVisible, unit = '', size, style }: Props) => {
  const api = useApi();
  const fBalance = formatBalance(value, { withSi: false });
  const fUnit = transformCurrency(formatBalance.calcSi(value.toString(), api.registry.chainDecimals[0]).value, unit);
  const isColored = parseInt(fBalance) >= 0;
  const classes = useStyles({ colored: isColored, visible: isVisible });

  const TypographyVariant = size === 'large' ? 'subtitle1' : 'subtitle2';

  return  (
    <Box component='span' className={classes.root} style={style}>
      <Typography variant={TypographyVariant} className={classes.blur} >
        {`${fBalance} ${fUnit}`}
      </Typography>
    </Box>
  );
};

export default React.memo(BalanceValue);
