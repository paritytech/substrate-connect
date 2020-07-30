import React, { useState } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom'; // Pages
import { CssBaseline } from '@material-ui/core';
import { ThemeProvider, createMuiTheme, makeStyles } from '@material-ui/core/styles';

import { ApiContext } from './utils/contexts';
import { useApiCreate } from './hooks';

import { SubstrateLight, SubstrateDark } from './themes';
import {
	Home
} from './pages';

import { 
	ThemeHeader,
	ThemeButton,
	LogoSubstrate
} from './components';

interface Props {
  className?: string;
}

const useStyles = makeStyles(theme => ({
	root: {
		alignItems: 'center',
		display: 'flex',
		flexDirection: 'column',
		padding: theme.spacing(3),
	},
	main: {
		maxWidth: theme.spacing(3) + 600 + 'px',
	},
}));

const  App: React.FunctionComponent<Props> = ({ className }: Props) => {
	const api = useApiCreate();

	const classes = useStyles();
	const [theme, setTheme] = useState(true)
	const appliedTheme = createMuiTheme(theme ? SubstrateLight : SubstrateDark)

	return (
		<BrowserRouter>
			<div className={classes.root + ' ' + className}>
				<ThemeProvider theme={appliedTheme}>
					<CssBaseline />
					<ThemeHeader>
						<LogoSubstrate theme={theme} />
						<ThemeButton theme={theme} onClick={() => setTheme(!theme)} />
					</ThemeHeader>
					<main className={classes.main}>
						{api && (
							<ApiContext.Provider value={api}>
								<div className='toolbar' />
								<Switch>
									<Route exact path='/' component={Home} />
								</Switch>
							</ApiContext.Provider>
						)}
					</main>
				</ThemeProvider>
			</div>
		</BrowserRouter>
	);
};

export default App;
