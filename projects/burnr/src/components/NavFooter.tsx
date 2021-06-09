import React from 'react';

import { Typography, Box, Link, Grid } from '@material-ui/core';

const AppFooter: React.FunctionComponent = () => (
  <Box paddingBottom={2}>
    <Typography variant='body2' component='div'>
      <Grid container spacing={1}>
        <Grid item>
          <Link href='#' color='textPrimary'>
          © {new Date().getFullYear()} Parity Technologies
          </Link>
        </Grid>
        <Grid item>
          <Link href='#' color='textPrimary'>
        Terms & conditions
          </Link>
        </Grid>
        <Grid item>
          <Link href='#' color='textPrimary'>
        Privacy policy
          </Link>
        </Grid>
        <Grid item>
          <Link href='#' color='textPrimary'>
        Report an issue
          </Link>
        </Grid>
      </Grid>
    </Typography>
  </Box>
);

export default AppFooter;
