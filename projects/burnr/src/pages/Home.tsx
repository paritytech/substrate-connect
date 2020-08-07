import React from 'react';

import { Grid, Paper, Divider, IconButton, Box } from '@material-ui/core';
import VisibilityIcon from '@material-ui/icons/Visibility';

import { NavTabs, AccountCard, BalanceValue } from '../components';

import { useUserInfo } from '../hooks';
import { users } from '../constants';

function Home ():  React.ReactElement {

	const userInfo = useUserInfo(users.westend);
	return (
		<>
			<Divider/>
			<Paper>
				<Box paddingX={2} paddingY={1}>
					<Grid container alignItems='center'>
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
							<BalanceValue value={1234.56} size='large' />
							<IconButton>
								<VisibilityIcon />
							</IconButton>
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
