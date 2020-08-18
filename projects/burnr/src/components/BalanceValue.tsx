import React from 'react';

import { makeStyles, Theme } from '@material-ui/core/styles';
import { Box, Typography } from '@material-ui/core';
import { SizeScale } from './../utils/types';
import { CSSProperties } from '@material-ui/core/styles/withStyles';

interface Props extends SizeScale {
	value: number | string;
	style?: CSSProperties;
}
interface StyleProps {
  colored?: boolean;
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
}));

const BalanceValue: React.FunctionComponent<Props> = ({ value, size, style }: Props) => {
	const isBalance = typeof value === 'number';
	const isColored = isBalance && value >= 0 ? true : false;
	const classes = useStyles({ colored: isColored });

	const TypographyVariant = size === 'large' ? 'subtitle1' : 'subtitle2';

	return  (
		<Box component='span' className={classes.root} style={style}>
			<Typography variant={TypographyVariant}>
				{value}
				{isBalance && ' KSM'}
			</Typography>
		</Box>
	);
};

export default React.memo(BalanceValue);
