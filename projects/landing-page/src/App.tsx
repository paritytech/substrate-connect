import React from 'react';
import { Container, CssBaseline, Paper, Grid, ThemeProvider, createMuiTheme } from '@material-ui/core';
import { theme, Loader, Logo, Sidebar } from './components';

const App: React.FunctionComponent = () => {
  return (
    <ThemeProvider theme={createMuiTheme(theme)}>
      <Loader />
      <div className='flex'>
        <div>hello</div>
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
      </div>
      
      <div>
        <CssBaseline />
        <Container fixed>
          <Grid container spacing={3}>
            <Grid item xs={9}>
              <Paper>xs=9</Paper>
            </Grid>
          </Grid>
        </Container>
      </div>
    </ThemeProvider>
  );
}

export default App;
