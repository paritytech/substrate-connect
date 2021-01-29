import React from 'react';

import { Grid, Paper, Divider, IconButton, Box, makeStyles, Theme } from '@material-ui/core';
import VisibilityIcon from '@material-ui/icons/Visibility';

import { NavTabs, AccountCard, BalanceValue, Bg } from '../components';

import { useUserInfo } from '../hooks';
import { users } from '../utils/constants';

const useStyles = makeStyles((theme: Theme) => ({
	paperAccount: {
		borderTopLeftRadius: theme.spacing(0.5),
	},
})
);

// @TODO read balance
// @TODO account name

function Home ():  React.ReactElement {
	const classes = useStyles();
	const userInfo = useUserInfo(users.polkadot);

	return (
		<>
			<Bg />
			<Divider/>
			<Paper square className={classes.paperAccount}>
				<Box paddingY={1} paddingX={2}>
					<Grid container alignItems='center' spacing={1}>
						<Grid item xs={6}>
							{
								userInfo.address &&
								<AccountCard
									account={{
										address: userInfo.address,
										name: 'account name',
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
};

export default Home;
