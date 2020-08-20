import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom'; // Pages
import { makeStyles } from '@material-ui/core/styles';

import { ApiContext } from './utils/contexts';
import { useApiCreate } from './hooks';

import { Home } from './pages';

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
		maxWidth: theme.spacing(3) + 600 + 'px',
		padding: theme.spacing(2),
		flex: 1,
	},
}));

const  App: React.FunctionComponent<Props> = ({ className }: Props) => {
	const api = useApiCreate();
	const classes = useStyles();

	return (
		<BrowserRouter>
			<div className={classes.root + ' ' + className}>
				<ThemeToggleProvider>
					<main className={classes.main}>
						<ApiContext.Provider value={api}>
							<Head />
						</ApiContext.Provider>
						{api && (
							<ApiContext.Provider value={api}>
								<Switch>
									<Route exact path='/' component={Home} />
								</Switch>
							</ApiContext.Provider>
						)}
					</main>
					<NavFooter />
				</ThemeToggleProvider>
			</div>
		</BrowserRouter>
	);
};

export default App;
