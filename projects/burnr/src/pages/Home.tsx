import React from 'react';

import { Grid, Paper, Divider, IconButton, Box } from '@material-ui/core';
import VisibilityIcon from '@material-ui/icons/Visibility';

import { NavTabs, LogoApp, NodeSelector, AccountCard, BalanceValue, NavFooter } from '../components';

function Home ():  React.ReactElement {

	return (
		<>
			<Grid container alignItems='center'>
				<Grid item xs={6}>
					<Box paddingX={2}>
						<LogoApp/>
					</Box>
				</Grid>
				<Grid item xs={6}>
					<Paper>
						<Box paddingX={2}>
							<NodeSelector/>
						</Box>
					</Paper>
				</Grid>
			</Grid>
			<Divider/>
			<Paper>
				<Box paddingX={2}>
					<Grid container alignItems='center'>
						<Grid item xs={6}>
							<AccountCard
								account={{
									address: '13HJwtWXxCfpk8iW9BWg1mBiaMvjUjTxytE8prFkKFiMUztM',
									name: 'account name',
								}}
							/>
						</Grid>
						<Grid item xs={6}>
							<BalanceValue value={1234.56} size='Big' />
							<IconButton>
								<VisibilityIcon />
							</IconButton>
						</Grid>
					</Grid>
				</Box>
			</Paper>
			<Divider/>
			<NavTabs />
			<NavFooter />
		</>

	);
};

export default Home;
