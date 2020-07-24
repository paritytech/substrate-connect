import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom'; // Pages
import styled from 'styled-components';
import { CssBaseline } from '@material-ui/core';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

import { ApiContext } from './utils/contexts';
import { useApiCreate } from './hooks';

import {
  Home,
  RouterExample,
  StyledExample,
  Usage
} from './pages';

import { 
  Header,
  SideMenu
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
          <SideMenu />
          <main className='main'>
            {api && (
              <ApiContext.Provider value={api}>
                  <div className='toolbar' />
                  <Switch>
                    <Route exact path='/' component={Home} />
                    <Route exact path='/usage' component={Usage} />
                    <Route path='/styled-example' component={StyledExample} />
                    <Route path='/account/:address' component={RouterExample} />
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
}
.toolbar {
  ${theme.mixins.toolbar}
}
`);
