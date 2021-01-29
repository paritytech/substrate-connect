import React from 'react';

import { red } from '@material-ui/core/colors';
import { Grid, Button, Typography, makeStyles, Theme, createStyles } from '@material-ui/core';
import LanguageIcon from '@material-ui/icons/Language';
import GetAppIcon from '@material-ui/icons/GetApp';
import WhatshotIcon from '@material-ui/icons/Whatshot';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		section: {
			paddingTop: theme.spacing(2),
		},
	})
);

const AccountMenu: React.FunctionComponent = () => {
	const classes = useStyles();

	return (
		<Grid
			container
			direction='column'
		>
			<Grid item className={classes.section}>
				<Grid item xs={12}>
					<Typography variant='overline'>
			      Block explorers
					</Typography>
				</Grid>
				<Grid item xs={12}>
					<Button startIcon={<LanguageIcon />}>
            Polkascan
					</Button>
				</Grid>
				<Grid item xs={12}>
					<Button startIcon={<LanguageIcon />}>
            Polkastats
					</Button>
				</Grid>
			</Grid>

			<Grid item className={classes.section}>
				<Grid item xs={12}>
					<Typography variant='overline'>
            Export
					</Typography>
				</Grid>
				<Grid item xs={12}>
					<Button startIcon={<GetAppIcon />}>
            JSON file
					</Button>
				</Grid>
				<Grid item xs={12}>
					<Button startIcon={<GetAppIcon />}>
            Seed phrase
					</Button>
				</Grid>
			</Grid>
			<Grid item className={classes.section}>
				<Button style={{ color: red[500] }} startIcon={<WhatshotIcon />}>
          Burn
				</Button>
			</Grid>
		</Grid>
	);
};

export default AccountMenu;
