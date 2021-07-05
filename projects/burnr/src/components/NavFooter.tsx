import React from 'react';

import { Typography, Box, Link, Grid } from '@material-ui/core';

const AppFooter: React.FunctionComponent = () => (
  <Box paddingBottom={2}>
    <Typography variant='body2' component='div'>
      <Grid container spacing={1}>
        <Grid item>
          <Link href='https://www.parity.io/' underline="hover" color='textPrimary'>
          © {new Date().getFullYear()} Parity Technologies
          </Link>
        </Grid>
        <Grid item>
          <Link href='https://substrate.dev/terms' underline="hover" target="_blank" rel="noreferrer" color='textPrimary'>
        Terms & conditions
          </Link>
        </Grid>
        <Grid item>
          <Link href='https://www.parity.io/privacy/' underline="hover" target="_blank" rel="noreferrer" color='textPrimary'>
        Privacy policy
          </Link>
        </Grid>
        <Grid item>
          <Link href='https://github.com/paritytech/substrate-connect/issues' underline="hover" target="_blank" rel="noreferrer" color='textPrimary'>
        Report an issue
          </Link>
        </Grid>
      </Grid>
    </Typography>
  </Box>
);

export default AppFooter;
