// SPDX-License-Identifier: Apache-2
import React from 'react';
import { Route, Redirect, Switch } from 'react-router';
import styled from 'styled-components';

import { ApiContext } from './contexts';
import { useApiCreate } from './hooks';
import { GlobalStyle } from './styles/globalStyles';

import Home from './pages/Home';

interface Props {
  className?: string;
}

function App ({ className }: Props): React.ReactElement<Props> {
  const api = useApiCreate();

  return (
    <main className={className}>
      <GlobalStyle/>
      {api && (
        <ApiContext.Provider value={api}>
          <Auth>
            <EvtTxProvider>
              <Switch>
                <Route path='/home'>
                  <Home />
                </Route>
              </Switch>
            </EvtTxProvider>
          </Auth>
        </ApiContext.Provider>
      )}
    </main>
  );
}

export default React.memo(styled(App)`
  width: 100%;
  min-height: calc(100vh - 72px);
  display: flex;
  flex-direction: column;
  align-items: stretch;
`);