import React, { useEffect, useState } from 'react';

import { Grid, Paper, Divider, IconButton, Box, makeStyles, Theme } from '@material-ui/core';
import VisibilityIcon from '@material-ui/icons/Visibility';

import { uniqueNamesGenerator, Config, starWars } from 'unique-names-generator';
import { Keyring } from '@polkadot/api';
import { mnemonicGenerate } from '@polkadot/util-crypto';
import { UserAccount } from './utils/types';

import { NavTabs, AccountCard, BalanceValue, Bg } from './components';

import { useUserInfo, useLocalStorage } from './hooks';
import { users } from './utils/constants';

const useStyles = makeStyles((theme: Theme) => ({
		paperAccount: {
			borderTopLeftRadius: theme.spacing(0.5),
		},
	})
);

const config: Config = {
	dictionaries: [starWars]
}

// @TODO read balance
// @TODO account name
function Home ():  React.ReactElement {
	const classes = useStyles();
	const [endpoint] = useLocalStorage('endpoint');
	const [localStorageAccount, setLocalStorageAccount] = useLocalStorage(endpoint?.split('-')[0]?.toLowerCase());
	const [user, setUser] = useState<UserAccount>();

	useEffect(() => {
		let userTmp;
		if (!localStorageAccount) {
			const mnemonic = mnemonicGenerate();
			const pair = new Keyring({ type: 'sr25519' })
				.addFromUri(mnemonic, { name: uniqueNamesGenerator(config) }, 'sr25519');
			userTmp = {
				address: pair.address,
				name: pair.meta.name || '____ _____'
				// mnemonic,	// just saving the mnemonic for now - will drop if not needed
			}
			setLocalStorageAccount(JSON.stringify(userTmp));
			// delete userTmp.mnemonic; // this is temp
			setUser(userTmp);
		} else {
			// delete userTmp.mnemonic; // this is temp
			setUser(JSON.parse(localStorageAccount));
		}
	}, [localStorageAccount]);

	const userInfo = useUserInfo(localStorageAccount && JSON.parse(localStorageAccount).address);

	return (
		<>
			<Bg />
			<Divider/>
			<Paper square className={classes.paperAccount}>
				<Box paddingY={1} paddingX={2}>
					<Grid container alignItems='center' spacing={1}>
						<Grid item xs={6}>
							{
								userInfo?.address &&
								<AccountCard
									account={{
										address: userInfo.address,
										name: user.name
									}}
								/>
							}
						</Grid>
						<Grid item xs={6}>
							<Grid
								container
								spacing={1}
								wrap='nowrap'
								alignItems='center'
							>
								<Grid item xs={12}>
									<BalanceValue
										value={1234.56}
										size='large'
										style={{ width: '100%', justifyContent: 'flex-end' }}
									/>
								</Grid>
								<Grid item>
									<IconButton style={{ borderRadius: 4 }} >
										<VisibilityIcon />
									</IconButton>
								</Grid>
							</Grid>
						</Grid>
					</Grid>
				</Box>
			</Paper>
			<Divider/>
			<NavTabs />
		</>
	);
}

export default Home;
