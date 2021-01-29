import React from 'react';
import { Link, makeStyles } from '@material-ui/core';

interface Props {
  theme: boolean;
}

const useStyles = makeStyles({
	root: {
		display: 'block',
		width: '120px',
		'& img': {
			maxWidth: '100%',
		},
	},
});

const LogoSubstrate: React.FunctionComponent<Props> = ({ theme }: Props) => {
	const classes = useStyles();
	const logoUrl = theme ? '/assets/images/logo_substrate.svg' : '/assets/images/logo_substrate_onDark.svg';
	return  (
		<Link href='http://substrate.io/' target='_blank' className={classes.root}>
			<img src={logoUrl}/>
		</Link>
	);
};

export default LogoSubstrate;
