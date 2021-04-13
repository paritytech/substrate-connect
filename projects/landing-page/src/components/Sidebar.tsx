import * as React from 'react';
import { makeStyles } from '@material-ui/core';
import { theme } from '.';

const useStyles = makeStyles(theme => ({
  root: {
    width: '345px !important',
    paddingLeft: theme.spacing(10),
  },
}));

const Sidebar: React.FunctionComponent = ({children}) => {
  const classes = useStyles();
  return (
    <>
      <div className={classes.root}>
        {children}
      </div>
    </>
  )
};

export default Sidebar;
