import React, { useState } from 'react';

import { red } from '@material-ui/core/colors';
import { Grid, Button, Typography, makeStyles, Theme, createStyles } from '@material-ui/core';
import LanguageIcon from '@material-ui/icons/Language';
import GetAppIcon from '@material-ui/icons/GetApp';
import WhatshotIcon from '@material-ui/icons/Whatshot';

import { openInNewTab, downloadFile } from '../utils/utils';
import { POLKA_ACCOUNT_ENDPOINTS } from '../utils/constants';
import { useLocalStorage } from '../hooks';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		section: {
			paddingTop: theme.spacing(2),
		},
	})
);

const { polkastats, polkascan } = POLKA_ACCOUNT_ENDPOINTS;

const AccountMenu: React.FunctionComponent = () => {
	const classes = useStyles();
	const [endpoint] = useLocalStorage('endpoint');
	const minEndpoint = endpoint?.split('-')[0]?.toLowerCase();
	const [localStorage] = useLocalStorage(minEndpoint);
	const [polkastatsUri] = useState(
		`https://${minEndpoint}.${polkastats}`
	);
	const [polkascanUri] = useState(`https://${polkascan}/${minEndpoint}`);

	const { address, json, seed } = JSON.parse(localStorage);
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
					<Button startIcon={<LanguageIcon />} onClick={() => openInNewTab(polkascanUri)}>
            Polkascan
					</Button>
				</Grid>
				<Grid item xs={12}>
					<Button startIcon={<LanguageIcon />} onClick={() => openInNewTab(polkastatsUri)}>
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
					<Button
						startIcon={<GetAppIcon />}
						onClick={() => downloadFile(address, JSON.stringify(json), 'json')}>
            JSON file
					</Button>
				</Grid>
				<Grid item xs={12}>
					<Button
						startIcon={<GetAppIcon />}
						onClick={() => downloadFile(address, seed, 'txt')}>
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
