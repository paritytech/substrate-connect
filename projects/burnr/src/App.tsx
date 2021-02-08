import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom'; // Pages
import { makeStyles } from '@material-ui/core/styles';
import { Paper, CircularProgress } from '@material-ui/core';
import { ApiContext, AccountContext } from './utils/contexts';
import { LocalStorageAccountCtx } from './utils/types';
import { useApiCreate, useLocalStorage } from './hooks';
import { createLocalStorageAccount } from './utils/utils';

import Home from './Home';

import { NavFooter, ThemeToggleProvider, Head } from './components';

interface Props {
  className?: string;
}

const useStyles = makeStyles(theme => ({
	root: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		minHeight: '100vh',
	},
	main: {
		width: '100%',
		maxWidth: theme.spacing(3) + 650 + 'px',
		padding: theme.spacing(2),
		flex: 1,
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
}));

const isEmpty = (obj: any): boolean => (Object.keys(obj).length === 0 && obj.constructor === Object)

const App: React.FunctionComponent<Props> = ({ className }: Props) => {
	const api = useApiCreate();
	const classes = useStyles();
	const [endpoint, useEndpoint] = useLocalStorage('endpoint');
	if (!endpoint) useEndpoint('Polkadot-WsProvider');
	const [localStorageAccount, setLocalStorageAccount] = useLocalStorage(endpoint.split('-')[0]?.toLowerCase());

	const [account, setCurrentAccount] = useState<LocalStorageAccountCtx>({} as LocalStorageAccountCtx);
	const [loader, setLoader] = useState(true)

	useEffect((): void => {
		if (api && api.isReady) {
			if (!localStorageAccount) {
				const userTmp = createLocalStorageAccount();
				setLocalStorageAccount(JSON.stringify(userTmp));
				setCurrentAccount(userTmp);
			} else {
				setCurrentAccount(JSON.parse(localStorageAccount));
			}
			setLoader(false)
		}
	}, [localStorageAccount, api]);

	return (
		<BrowserRouter>
			<div className={classes.root + ' ' + className}>
				<ThemeToggleProvider>
					<AccountContext.Provider value={{ account, setCurrentAccount }}>
						<main className={classes.main}>
							<ApiContext.Provider value={api}>
								<Head />
								{loader ?
								(<Paper className={classes.loadingPaper}>
									<CircularProgress className={classes.loader} />
								</Paper>) :
								api && api.isReady && !isEmpty(account) && (
									<Switch>
										<Route exact path='/' component={Home} />
									</Switch>
								)}
							</ApiContext.Provider>
						</main>
						<NavFooter />
					</AccountContext.Provider>
				</ThemeToggleProvider>
			</div>
		</BrowserRouter>
	);
};

export default App;
