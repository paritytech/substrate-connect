import React, { useState } from 'react';
import { ThemeProvider, createMuiTheme, CssBaseline, makeStyles } from '@material-ui/core';
import { SubstrateLight, SubstrateDark } from './../themes';
import { useLocalStorage } from '../hooks';

import { LogoSubstrate, ThemeButton } from '../components';

const useStyles = makeStyles(theme => ({
  root: {
    position: 'fixed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100vw',
    maxWidth: '1330px',
    padding: theme.spacing(2),
    paddingRight: theme.spacing(1),

    [theme.breakpoints.down('sm')]: {
      paddingTop: theme.spacing(1),
    },
  },
}));

// @TODO rewrite in a React way?

const ThemeToggleProvider: React.FunctionComponent = ({ children }) => {
  const classes = useStyles();
  const [localTheme, setLocalTheme] = useLocalStorage('theme');
  const [theme, setTheme] = useState(localTheme === 'false' ? false : true);
  const appliedTheme = createMuiTheme(theme ? SubstrateLight : SubstrateDark);

  const selectTheme = (selected: boolean) => {
    setLocalTheme(selected.toString());
    setTheme(selected);
  }

  return (
    <ThemeProvider theme={appliedTheme}>
      <CssBaseline />
      <div className={classes.root}>
        <LogoSubstrate theme={theme} />
        <ThemeButton theme={theme} onClick={() => selectTheme(!theme)} />
      </div>
      {children}
    </ThemeProvider>
  );
};

export default ThemeToggleProvider;
