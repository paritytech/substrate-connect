import * as React from 'react';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  root: {
    position: 'fixed',
    width: '100%',
    height: theme.spacing(0.5),
    backgroundColor: theme.palette.primary.main,
    zIndex: 1,
  },
}));

const Loader: React.FunctionComponent = () => {
  const classes = useStyles();
  return <div className={classes.root}/>
};

export default Loader;
