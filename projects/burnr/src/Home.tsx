import React, { useContext, useState } from 'react';
import { Grid, Paper, Divider, IconButton, Box, makeStyles, Theme } from '@material-ui/core';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import { AccountContext, BalanceVisibleContext } from './utils/contexts';
import { NavTabs, AccountCard, BalanceValue, Bg, AccountMenu } from './components';
import { useUserInfo, useBalance } from './hooks';

const useStyles = makeStyles((theme: Theme) => ({
		paperAccount: {
			borderTopLeftRadius: theme.spacing(0.5),
		},
	})
);

function Home ():  React.ReactElement {
	const { account } = useContext(AccountContext);
	const classes = useStyles();
	const userInfo = useUserInfo(account.userAddress);
	const balanceArr = useBalance(account.userAddress);
	const balance = balanceArr[1];
	const unit = balanceArr[3];
	const [balanceVisibility, setBalanceVisibility] = useState<boolean>(true);

	return (
		<BalanceVisibleContext.Provider value={{ balanceVisibility, setBalanceVisibility }}>
			<Bg />
			<Divider/>
			<Paper square className={classes.paperAccount}>
				<Box paddingY={1} paddingX={2}>
					<Grid container alignItems='center' spacing={1}>
						<Grid item xs={6}>
							{
								userInfo?.address &&
								<Grid container wrap='nowrap' alignItems='center'>
									<Grid item>
										<AccountCard
											account={{
												address: userInfo.address,
												name: account?.userName
											}}
										/>
									</Grid>
									<Grid item>
										<AccountMenu />
									</Grid>
								</Grid>
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
										isVisible={balanceVisibility}
										value={balance}
										unit={unit}
										size='large'
										style={{ width: '100%', justifyContent: 'flex-end' }}
									/>
								</Grid>
								<Grid item>
									<IconButton style={{ borderRadius: 4 }} onClick={() => setBalanceVisibility(!balanceVisibility)}>
										{balanceVisibility ?
											(<VisibilityIcon />) :
											(<VisibilityOffIcon />)
										}
									</IconButton>
								</Grid>
							</Grid>
						</Grid>
					</Grid>
				</Box>
			</Paper>
			<Divider/>
			<NavTabs />
		</BalanceVisibleContext.Provider>
	);
}

export default Home;
