import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom'; // Pages
import styled from 'styled-components';
import { CssBaseline } from '@material-ui/core';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

import { ApiContext } from './utils/contexts';
import { useApiCreate } from './hooks';

import {
  Home
} from './pages';

import { 
  Header
} from './components';

import { theme } from './themes';

interface Props {
  className?: string;
}

const MuiTheme = createMuiTheme(theme);

const  App: React.FunctionComponent<Props> = ({ className }: Props) => {

  const api = useApiCreate();

  return (
    <BrowserRouter>
      <div className={className}>
        <ThemeProvider theme={MuiTheme}>
          <CssBaseline />
          <Header />
          <main className='main'>
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

export default React.memo(styled(App)`
display: flex;
.main {
  flex-grow: 1;
  padding: ${theme.spacing(3)}px;
  margin: 0 auto;
  max-width: ${2 * theme.spacing(3) + 600}px;
}
.toolbar {
  ${theme.mixins.toolbar}
}
`);
