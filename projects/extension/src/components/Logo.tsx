import * as React from 'react';
import { makeStyles, Typography } from '@material-ui/core';
import { substrateGreen } from './theme';

const useStyles = makeStyles(theme => ({
  root: {
    marginBottom: theme.spacing(7),
    fontWeight: 600,
    lineHeight: 1,
    '& .green': {
      color: substrateGreen[300],
    },
    '& .lighter': {
      fontWeight: 400,
    }
  },
}));

const Logo: React.FunctionComponent = () => {
  const classes = useStyles();

  return (
    <Typography variant='h4' className={classes.root}>
      substrate
      <span className='green'>_</span>&nbsp;
      <span className='lighter'>connect</span>
    </Typography>
  );
};

export default Logo;
