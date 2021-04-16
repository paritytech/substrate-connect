import * as React from 'react';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    width: '100%',
    maxWidth: theme.breakpoints.values.lg,
    margin: 'auto',
    paddingTop: theme.spacing(5),
    paddingLeft: theme.spacing(5),
    paddingRight: theme.spacing(5),
    '& > *': {
      width: '100%',
    },
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column-reverse',
    },
  },
}));

const UIContainer: React.FunctionComponent = ({children}) => {
  const classes = useStyles();
  return <div className={classes.root}>{children}</div>
};

export default UIContainer;
