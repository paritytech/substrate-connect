import React from 'react';
import { Container, CssBaseline, Typography, Paper, Grid } from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { Logo } from './components';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      padding: '2em 0'
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: 'left',
    },
  }),
);

const App = () => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <CssBaseline />
      <Container fixed>
        <Grid container spacing={3}>
          <Grid item xs={9}>
            <Paper className={classes.paper}>xs=9</Paper>
          </Grid>
          <Grid item xs={3}>
            <div className={classes.paper}><Logo /></div>
            <div className={classes.paper}>xs=3</div>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

export default App;
