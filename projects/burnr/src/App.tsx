import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom'; // Pages
import { makeStyles } from '@material-ui/core/styles';
import { ApiContext, AccountContext } from './utils/contexts';
import { LocalStorageAccountCtx } from './utils/types';
import { useApiCreate, useLocalStorage } from './hooks';
import { createLocalStorageAccount } from './utils/utils';

import Home from './Home';

import { NavFooter, ThemeToggleProvider, Head, ErrorBoundary, BurnrBG, BurnrDivider } from './components';

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
    maxWidth: `${theme.spacing(3) + 650}px`,
    padding: theme.spacing(2),
    flex: 1,
  }
}));

const App: React.FunctionComponent<Props> = ({ className = '' }: Props) => {
  const api = useApiCreate();
  const classes = useStyles();
  const [endpoint, setEndpoint] = useLocalStorage('endpoint');
  if (!endpoint) setEndpoint('Polkadot-WsProvider');
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
  }, [localStorageAccount, setLocalStorageAccount, api]);

  return (
    <BrowserRouter>
      <div className={`${classes.root} ${className}`}>
        <ThemeToggleProvider>
          <AccountContext.Provider value={{ account, setCurrentAccount }}>
            <ErrorBoundary>
              <main className={classes.main}>
                <ApiContext.Provider value={api}>
                  <Head />
                  <BurnrDivider />
                  <Home account={account} loader={loader} />
                  <BurnrBG />
                </ApiContext.Provider>
              </main>
              <NavFooter />
            </ErrorBoundary>
          </AccountContext.Provider>
        </ThemeToggleProvider>
      </div>
    </BrowserRouter>
  );
};

export default App;
