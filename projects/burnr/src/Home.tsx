import React, { useState, useEffect } from 'react';
import { Grid, Paper, Divider, IconButton, Box, makeStyles, CircularProgress } from '@material-ui/core';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import { BalanceVisibleContext } from './utils/contexts';
import { LocalStorageAccountCtx } from './utils/types';
import { NavTabs, AccountCard, BalanceValue, Bg, AccountMenu } from './components';
import { useBalance, useLocalStorage } from './hooks';

const useStyles = makeStyles(theme => ({
		paperAccount: {
			borderTopLeftRadius: theme.spacing(0.5),
		},
    loadingPaper: {
      height: '90vh',
      textAlign: 'center',
    },
    loader: {
      height: '50px',
      width: '50px',
      marginTop: '10vh',
    },
	})
);

interface Props {
	account?: LocalStorageAccountCtx;
  loader?: boolean;
}

const Home: React.FunctionComponent<Props> =  ({ account, loader }: Props) => {
	const [localBalance, setLocalBalance] = useLocalStorage('balanceVisibility');
	const [balanceVisibility, setBalanceVisibility] = useState<boolean>(localBalance !== 'false');
	const classes = useStyles();
	const balanceArr = useBalance(account?.userAddress || '');
	const balance = balanceArr[1];
	useEffect((): void => {
		setLocalBalance(balanceVisibility ? 'true' : 'false')
	}, [balanceVisibility, setLocalBalance])

	return loader ? (
    <Paper className={classes.loadingPaper}>
      <CircularProgress className={classes.loader} />
    </Paper>)
    : (
		<BalanceVisibleContext.Provider value={{ balanceVisibility, setBalanceVisibility }}>
			<Bg />
			<Divider/>
			<Paper square className={classes.paperAccount}>
				<Box paddingY={1} paddingX={2}>
					<Grid container alignItems='center' spacing={1}>
						<Grid item xs={6}>
							{
								account?.userAddress &&
								<Grid container wrap='nowrap' alignItems='center'>
									<Grid item>
										<AccountCard
											account={{
												address: account?.userAddress,
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
