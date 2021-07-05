import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom'; // Pages
import { makeStyles } from '@material-ui/core/styles';
import { ApiContext, AccountContext } from './utils/contexts';
import { LocalStorageAccountCtx } from './utils/types';
import { useApiCreate, useLocalStorage } from './hooks';
import { createLocalStorageAccount } from './utils/utils';
import { ALL_PROVIDERS } from './utils/constants';
import { ApiPromise } from '@polkadot/api';

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
  const api: ApiPromise = useApiCreate();
  const classes = useStyles();
  const [endpoint, setEndpoint] = useLocalStorage('endpoint');
  if (!endpoint) {
    setEndpoint(ALL_PROVIDERS.network);
  }
  const [localStorageAccount, setLocalStorageAccount] = useLocalStorage(endpoint?.toLowerCase());

  const [account, setCurrentAccount] = useState<LocalStorageAccountCtx>({} as LocalStorageAccountCtx);
  const [loader, setLoader] = useState(true)

  useEffect((): void => {
    const callSetters = async () => {
      if (await api.isReady) {
        if (!localStorageAccount) {
          const userTmp = createLocalStorageAccount();
          setLocalStorageAccount(JSON.stringify(userTmp));
          setCurrentAccount(userTmp);
        } else {
          setCurrentAccount(JSON.parse(localStorageAccount));
        }
        setLoader(false);
      }  
    }

    api && callSetters();
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
