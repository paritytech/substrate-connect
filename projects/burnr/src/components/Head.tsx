import React from 'react';

import { Box, Grid, makeStyles, Theme, Typography } from '@material-ui/core';
import { NodeSelector } from '../components';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    [theme.breakpoints.down('sm')]: {
      paddingTop: theme.spacing(7),
    },
  },
}));

const Head: React.FunctionComponent = () => {
  const classes = useStyles();

  return (
    <Grid container alignItems='center' className={classes.root}>
      <Grid item xs={6}>
        <Box paddingX={2}>
          <Typography variant='h1'>Burnr</Typography>
        </Box>
      </Grid>
      <Grid item xs={6}>
        <NodeSelector/>
      </Grid>
    </Grid>
  );
};

export default Head;
