import React from 'react';
import { Container, CssBaseline, Paper, Grid, ThemeProvider, createMuiTheme } from '@material-ui/core';
import { theme, Loader, Logo, Sidebar, UIContainer } from './components';

const App: React.FunctionComponent = () => {
  return (
    <ThemeProvider theme={createMuiTheme(theme)}>
      <CssBaseline />
      <Loader />
      <UIContainer>
        <div>
          content
        </div>
        <Sidebar>
          <Logo />
          <ul>
            <li>Substrate-based chain</li>
            <li>Light Clients</li>
            <li>Supported Networks</li>
            <li>Getting Starter</li>
            <li>Projects</li>
            <li>Playground</li>
            <li>Github Repository</li>
          </ul>
        </Sidebar>
      </UIContainer>
    </ThemeProvider>
  );
}

export default App;
