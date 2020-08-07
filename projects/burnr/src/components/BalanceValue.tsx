import React from 'react';

import { makeStyles, Theme } from '@material-ui/core/styles';
import { Box, Typography } from '@material-ui/core';
import { SizeScale } from './types';

interface Props extends SizeScale {
  value: number | string;
}
interface StyleProps {
  colored?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
	root: {
		display: 'inline-flex',
		padding: theme.spacing(0.5),
		borderRadius: theme.spacing(0.5),
		backgroundColor: (props: StyleProps) =>
			props.colored
				? theme.palette.primary.main
				: '',
		color: (props: StyleProps) =>
			props.colored
				? theme.palette.getContrastText(theme.palette.primary.main)
				: theme.palette.text.primary,
	},
}));

const BalanceValue: React.FunctionComponent<Props> = ({ value, size }: Props) => {
	const colored = typeof value == 'number' && value >= 0 ? true : false;
	const classes = useStyles({ colored: colored });

	const TypographyVariant = size == 'large' ? 'subtitle1' : 'subtitle2';

	return  (
		<Box component='span' className={classes.root}>
			<Typography variant={TypographyVariant}>{value}</Typography>
		</Box>
	);
};

export default React.memo(BalanceValue);
